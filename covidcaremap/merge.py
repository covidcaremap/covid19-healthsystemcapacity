import folium
import geopandas as gpd
import libpysal
import numpy as np
import pandas as pd
from libpysal.cg import fast_knn
from scipy.spatial.distance import euclidean
from shapely.geometry import MultiPoint
from shapely.ops import nearest_points
from sklearn.preprocessing import normalize

from covidcaremap.geo import spatial_join_facilities
from covidcaremap.mapping import HospMap
from rapidfuzz import fuzz


class Matcher:
    def __init__(self,
                 matched_to,
                 matched_from,
                 matched_to_uuid,
                 matched_from_uuid):

        self.matching_key = []

        self.d1 = matched_to
        self.d1_uuid = matched_to_uuid
        self.d1_c = matched_to.to_crs('epsg:5070')

        self.d2 = matched_from
        self.d2_uuid = matched_from_uuid
        self.d2_c = matched_from.to_crs('epsg:5070')

        self.d1_unmatched = None
        self.d1_matched = None
        self.d2_unmatched = None
        self.d2_matched = None
        self.update_matches()

    def match_point_set(self, bounds, n=10):

        if len(self.d2) < n:
            n = len(self.d2)

        d2_points = [(i.x, i.y) for i in self.d2_unmatched.geometry]
        n_matched = 0

        for i in range(len(self.d1_unmatched)):
            matched = False

            to_match = self.d1_unmatched.iloc[i]
            to_match_str = fuzz_str(to_match)

            pts = [(self.d1_unmatched.geometry[i].x,
                    self.d1_unmatched.geometry[i].y)] + d2_points
            kd = libpysal.cg.KDTree(np.array(pts))
            wnn2 = libpysal.weights.KNN(kd, n)

            neighbor_indices = [i - 1 for i in wnn2.neighbors[0]]

            dists = []
            ratios = []
            first = self.d2_unmatched.iloc[neighbor_indices[0]]

            for x in range(n):
                dists.append(
                    round(euclidean(pts[0], pts[neighbor_indices[x] + 1])))
                s = fuzz_str(self.d2_unmatched.iloc[neighbor_indices[x]])
                ratios.append(fuzz.ratio(to_match_str, s))

            if not matched:
                matched = dists[0] <= bounds[0] and dists[1] > bounds[1]
                source = 'dist threshhold' if matched else 'unmatched'

            if not matched:
                matched = (np.max(ratios) == ratios[0]) and dists[0] < 10000
                source = 'top dist and str match' if matched else 'unmatched'

            if not matched:
                norm_dists = normalize(np.array([dists]))[0]
                norm_str = normalize(np.array([ratios]))[0]
                nvs = [np.mean([1 - norm_dists[z], norm_str[z]])
                       for z in range(n)]
                norm_match_idx = np.argmax(nvs)

                norm_d = dists[norm_match_idx]
                norm_r = ratios[norm_match_idx]
                if norm_match_idx < 3 and norm_d < 1000:
                    matched = True
                    source = 'normalized average'

            if matched:
                self.matching_key.append({
                    self.d1_uuid: to_match[self.d1_uuid],
                    self.d2_uuid: first[self.d2_uuid],
                    'dist_apart': dists[0],
                    'match source': source
                })
                n_matched += 1
            if (i + 1) % 250 == 0:
                print('Completed [{}] of {} facilities, prelim matched {}'.format(
                    i+1, len(self.d1_unmatched), n_matched))

        self.update_matches()
        print('Completed matching and deduping facilities, matched {} of {}'.format(
            len(self.matching_key), len(self.d1)))

    def update_matches(self):
        mk = self.matching_key_df()
        self.d1_unmatched = self.d1_c[~self.d1_c[self.d1_uuid].isin(
            mk[self.d1_uuid])].reset_index(drop=True)
        self.d1_matched = self.d1_c[self.d1_c[self.d1_uuid].isin(
            mk[self.d1_uuid])].reset_index(drop=True)

        self.d1_matched = gpd.GeoDataFrame(
            pd.merge(mk, self.d1_matched, on=self.d1_uuid).sort_values(
                by='matching_uuid'),
            crs='epsg:5070')

        self.d2_matched = self.d2_c[self.d2_c[self.d2_uuid].isin(
            mk[self.d2_uuid])].reset_index(drop=True)
        self.d2_unmatched = self.d2_c[~self.d2_c[self.d2_uuid].isin(
            mk[self.d2_uuid])].reset_index(drop=True)
        self.d2_matched = gpd.GeoDataFrame(
            pd.merge(mk, self.d2_matched, on=self.d2_uuid).sort_values(
                by='matching_uuid'),
            crs='epsg:5070')

        self.remove_duplicate_matches()

    def remove_duplicate_matches(self):
        dupes = self.d2_matched[self.d2_matched[self.d2_uuid].duplicated(
            False)]

        def _f(x):
            g = x.copy()

            hierarchy = {
                'dist threshhold': 1,
                'top dist and str match': 2,
                'normalized average': 3
            }

            g['hierarchy'] = g['match source'].apply(lambda y: hierarchy[y])

            top = g[g['hierarchy'] == np.min(g['hierarchy'])].copy()

            if len(top) > 1:
                top = top.sort_values('dist_apart').head(1).copy()

            return top.index[0]

        best_idx = [_f(dupes.loc[v])
                    for _, v in dupes.groupby(self.d2_uuid).groups.items()]
        unmatched = dupes.drop(best_idx)

        self.d2_matched = self.d2_matched.drop(unmatched.index)

        self.d1_matched = self.d1_matched[~self.d1_matched['Provider Number'].isin(
            unmatched['Provider Number'])]
        self.d1_unmatched = self.d1_unmatched.append(
            self.d1[self.d1['Provider Number'].isin(unmatched['Provider Number'])])

        self.matching_key = [k for k in self.matching_key if str(
            k[self.d1_uuid]) in self.d1_matched[self.d1_uuid].astype(str).values]

    def matching_key_df(self):
        if self.matching_key == []:
            df = pd.DataFrame(
                {self.d1_uuid: [], self.d2_uuid: [], 'distance': []}, dtype=object)
        else:
            df = pd.DataFrame(self.matching_key, dtype=object)

        df['matching_uuid'] = df[self.d1_uuid].astype(
            str) + '-' + df[self.d2_uuid].astype(str)

        return df

    def map_unmatched(self, names=('hcris', 'dh'), colors=('red', 'blue'), addl_labels=None):
        m = HospMap()
        m.add_point_subset(
            self.d1_unmatched.to_crs('epsg:4326'),
            names[0],
            colors[0],
            addl_labels=addl_labels)
        m.add_point_subset(
            self.d2_unmatched.to_crs('epsg:4326'),
            names[1],
            colors[1],
            addl_labels=addl_labels)

        return m

    def map_matched(self, names=('hcris', 'dh'), colors=('red', 'blue'), addl_labels=None):
        m = HospMap()
        m.add_set(self.d1_matched.to_crs('epsg:4326'),
                  self.d2_matched.to_crs('epsg:4326'),
                  'connected', colors,
                  sort_col='matching_uuid',
                  addl_labels=addl_labels)

        m.add_point_subset(
            self.d1_matched.to_crs('epsg:4326'),
            'from',
            colors[0],
            addl_labels=addl_labels)

        m.add_point_subset(
            self.d2_matched.to_crs('epsg:4326'),
            'to',
            colors[1],
            addl_labels=addl_labels)

        return m

    def centroid(self):
        xs = []
        ys = []
        for i in self.d1['geometry']:
            ys.append(i.x)
            xs.append(i.y)
        return ((np.min(xs) + ((np.max(xs) - np.min(xs)) / 2)), (np.min(ys) + ((np.max(ys) - np.min(ys)) / 2)))

    def map_all(self, names, addl_labels=None):
        d1_name, d2_name = names
        m = HospMap(self.centroid(), 7)
        m.add_point_subset(self.d1_matched.to_crs('epsg:4326'), '{} - matched'.format(d1_name), color='blue', addl_labels=addl_labels)
        m.add_point_subset(self.d2_matched.to_crs('epsg:4326'), '{} - matched'.format(d2_name), color='red', addl_labels=addl_labels)
        m.add_point_subset(self.d1_unmatched.to_crs('epsg:4326'), '{} - unmatched'.format(d1_name), color='purple')
        m.add_point_subset(self.d2_unmatched.to_crs('epsg:4326'), '{} - unmatched'.format(d2_name), color='orange')
        m.add_connections(self.d1_matched.to_crs('epsg:4326'), self.d2_matched.to_crs('epsg:4326'))
        
        return m


def fuzz_str(r):
    return str({n: str(r[n]).lower() for n in [
        'HOSP10_Name',
        'Street_Addr',
        'STATE_NAME',
        'CITY_NAME',
        'ZIP_CODE',
        'COUNTY_NAME']})
