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
    """Class that stores and matched two facility datasets

    Args:
        matched_to (geopandas.GeoDataFrame): Dataset to match to (i.e. the dataset
            find matches for)
        matched_from (geopandas.GeoDataFrame): Dataset to match from (i.e. the dataset
            to search for matches from)
        matched_to_uuid (str): Unique identifier key in `matched_to` GeoDataFrame
        matched_from_uuid (str): Unique identifier key `matched_from` GeoDataFrame

    Attributes:
        matching_key(List[dict]): List of dicts that each contain ids of pairs 
            of matches between datasets as well as information about how they matched 
        d1 (geopandas.GeoDataFrame): Dataset to match to (i.e. the dataset
            find matches for), reprojected to NAD83 / Conus Albers for distance 
            measurement purposes
        d1_uuid (str): Unique identifier key in `d1` GeoDataFrame        
        d2 (geopandas.GeoDataFrame): Dataset to match from (i.e. the dataset
            to search for matches from), reprojected to NAD83 / Conus Albers for 
            distance measurement purposes
        d2_uuid (str): Unique identifier key `d2` GeoDataFrame
        d1_unmatched (geopandas.GeoDataFrame): Portion of `d1` that has not matched yet
        d1_matched (geopandas.GeoDataFrame): Portion of `d1` that has already matched
        d2_unmatched (geopandas.GeoDataFrame): Portion of `d2` that has not matched yet
        d2_matched (geopandas.GeoDataFrame): Portion of `d2` that has already matched

    Notes:
        #TODO: Should this be configurable?
        - Both `matched_to` and `matched_from` must have the following mapping from 
            field name to attriibutes (i.e. 'FIELD NAME' >> Attribute it describes):
                'HOSP10_Name' >> Hospital name
                'Street_Addr' >> Street address
                'STATE_NAME' >> State
                'CITY_NAME' >> City or municipality
                'ZIP_CODE' >> Zip code
                'COUNTY_NAME' >> County
    """

    def __init__(self,
                 matched_to,
                 matched_from,
                 matched_to_uuid,
                 matched_from_uuid):
        self.matching_key = []

        self.d1 = matched_to.to_crs('epsg:5070')
        self.d1_uuid = matched_to_uuid

        self.d2 = matched_from.to_crs('epsg:5070')
        self.d2_uuid = matched_from_uuid

        self.d1_unmatched = None
        self.d1_matched = None
        self.d2_unmatched = None
        self.d2_matched = None
        # In the constructor, all this does is populate the '_unmatched'
        # attributes with full copys of the datasets and the '_matched'
        # datasets with empty GeoDataFrames
        self.update_matches()

    def match_point_set(self, dist_threshhold, max_dist=2000, n=10, str_match_method='name'):
        """Match two different sets of facilities

        Description:
            This method includes all of the main matching functionality. It 
            takes iterates over all of d1 and finds the best match in d2 based on 
            a series of rules. After all d1 facilities have been matched (or at least 
            attempted to be matched), it de-duplicates the matches for d2 facilities
            that matched to multiple d1 facilities and updates the matched and unmatched
            attributes/

        Args:
            dist_threshhold ((int, int)): Tuple of distance threshold values (in meters) for 
                distance threshold matching. The first value represents the upper accepatable 
                bound for a distance match to be considered correct. The second indicates the lower 
                acceptable bound for the second nearest match. For two facilities to match based 
                exclusively on distance, the closest match must be lower than the first value and 
                the second closest must be higher than the second value.
            max_dist (int, optional): The maximum distance (in meters) that two matches can be apart.
                Defaults to 2000.
            n (int, optional): The number of neighbors to consider as potential options. 
                Defaults to 10.
            str_match_method (str, optional): Method for string matching of attributes. Must be
                one of 'name', 'properties', or 'average'. 'name' matches on just the hospital names.
                'properties' matches on a stringified version of a dict including name as well as
                address component. 'avg' takes the average score between 'name' and 'properties'. 
                Defaults to 'name'.

        Raises:
            Exception: Raises exception if string match method is not one of the
                available options
        """
        max_1st_neighbor, min_2nd_neighbor = dist_threshhold

        if str_match_method.lower() not in ('name', 'properties', 'avg'):
            raise Exception(
                '"str_match" parameter must be one of ("name", "properties", or "average"), got "{}"'.format(str_match_method))
        str_match_method = str_match_method.lower()

        # account for datasets that may have fewer than 'n' rows
        if len(self.d2) < n:
            n = len(self.d2)

        # prepare d2 coordinates in a list format that PySAL needs
        d2_points = [(i.x, i.y) for i in self.d2_unmatched.geometry]
        n_matched = 0

        # iterate over all facilities in d1
        for i in range(len(self.d1_unmatched)):
            matched = False

            # get a dict of attributed for the d1 (i.e. 'reference' facility)
            to_match = self.d1_unmatched.iloc[i]
            # and the string necessary for string matching on 'properties'
            to_match_str = fuzz_str(to_match)

            # create a list of coordinates for reference points and all points in
            # d2 dataset (i.e. 'candidate' points)
            pts = [(self.d1_unmatched.geometry[i].x,
                    self.d1_unmatched.geometry[i].y)] + d2_points

            # Get the n nearest neighbors from reference points
            kd = libpysal.cg.KDTree(np.array(pts))
            wnn2 = libpysal.weights.KNN(kd, n)
            neighbor_indices = [i - 1 for i in wnn2.neighbors[0]]

            # for each candidate point, consider distance and string
            # matching as criteria. generate lists of both values for
            # all n candidate points
            dists = []
            ratios = []
            # the likeliest candidate
            first = self.d2_unmatched.iloc[neighbor_indices[0]]

            for x in range(n):
                # euclidean distance between reference and candidate
                dists.append(
                    round(euclidean(pts[0], pts[neighbor_indices[x] + 1])))

                # string matching ratio according to desired str matching method
                s = fuzz_str(self.d2_unmatched.iloc[neighbor_indices[x]])
                s_name = self.d2_unmatched.iloc[neighbor_indices[x]]['HOSP10_Name'].lower(
                )
                r1 = fuzz.ratio(to_match_str, s)
                r2 = fuzz.ratio(to_match['HOSP10_Name'].lower(), s_name)
                if str_match_method == 'name':
                    ratios.append(r2)
                if str_match_method == 'properties':
                    ratios.append(r1)
                if str_match_method == 'avg':
                    ratios.append(np.mean([r1, r2]))

            # There are three different matching methods that are organized in
            # a hierarchy. If there is no macth between the reference and candidate
            # in the first method, fall back to the second, then the third before
            # detrmining that it didn't match. Store the matching method, (i.e.
            # 'source') for future reference.

            # 1) Distance threshold matching:
            #   does not consider string matching but just chooses based on
            #   the distances of the first and second closes candidate facilities
            if not matched:
                matched = dists[0] <= max_1st_neighbor and dists[1] > min_2nd_neighbor and dists[0] <= max_dist
                source = 'dist threshhold' if matched else 'unmatched'

            # 2) Top distance and str match
            # Match two points if the closest point is also the best string match
            # and also closer than max_dist
            if not matched:
                matched = (np.max(ratios) == ratios[0]) and dists[0] < max_dist
                source = 'top dist and str match' if matched else 'unmatched'

            # 3) Normalized average
            # Allows you to consider matched that are not the closest. Find
            # the option from the ten candidates that has the best average distance
            # and string score. Also only consider the match if it is closer than 2km
            # and within the top thr
            if not matched:
                norm_dists = normalize(np.array([dists]))[0]
                norm_str = normalize(np.array([ratios]))[0]
                nvs = [np.mean([1 - norm_dists[z], norm_str[z]])
                       for z in range(n)]
                norm_match_idx = np.argmax(nvs)

                norm_d = dists[norm_match_idx]
                if norm_d < max_dist:
                    matched = True
                    source = 'normalized average'

            # If a match has been found, append it to the key
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

        # Update matches, which includes deduplicating refernce facilities that matched
        # to the same candidate
        self.update_matches()
        print('Completed matching and deduping facilities, matched {} of {}'.format(
            len(self.matching_key), len(self.d1)))

    def update_matches(self):
        """
        Update matched and unmatched datasets and deduplicate matched within 
        the matching key
        """
        # Get a dataframe of matches
        mk = self.matching_key_df()

        # update reference unmatched and matched to only include faclities
        # that are and are not present, respectively, in the matching key
        # then add keys from the candidate dataset
        self.d1_unmatched = self.d1[~self.d1[self.d1_uuid].isin(
            mk[self.d1_uuid])].reset_index(drop=True)
        self.d1_matched = self.d1[self.d1[self.d1_uuid].isin(
            mk[self.d1_uuid])].reset_index(drop=True)
        self.d1_matched = gpd.GeoDataFrame(
            pd.merge(mk, self.d1_matched, on=self.d1_uuid).sort_values(
                by='matching_uuid'),
            crs='epsg:5070')

        # Do the same for the candidate dataset
        self.d2_matched = self.d2[self.d2[self.d2_uuid].isin(
            mk[self.d2_uuid])].reset_index(drop=True)
        self.d2_unmatched = self.d2[~self.d2[self.d2_uuid].isin(
            mk[self.d2_uuid])].reset_index(drop=True)
        self.d2_matched = gpd.GeoDataFrame(
            pd.merge(mk, self.d2_matched, on=self.d2_uuid).sort_values(
                by='matching_uuid'),
            crs='epsg:5070')

        # Remove matches that have duplicate cadidates
        self.remove_duplicate_matches()

    def remove_duplicate_matches(self):
        """
        Remove matches that have duplicate cadidates and update all
        GeoDataFrames accordingly. Choose the better of multiple duplicates.
        """
        # find all duplicate matches
        dupes = self.d2_matched[self.d2_matched[self.d2_uuid].duplicated(
            False)]

        def _f(x):
            """
            Find the best match among a group of duplicated matched
            """
            g = x.copy()

            # Choose based on the matching method hierarchy
            hierarchy = {
                'dist threshhold': 1,
                'top dist and str match': 2,
                'normalized average': 3
            }

            g['hierarchy'] = g['match source'].apply(lambda y: hierarchy[y])

            top = g[g['hierarchy'] == np.min(g['hierarchy'])].copy()

            # if the hierarchy doesn't resolve it, choose the closer match
            if len(top) > 1:
                top = top.sort_values('dist_apart').head(1).copy()

            return top.index[0]

        best_idx = [_f(dupes.loc[v])
                    for _, v in dupes.groupby(self.d2_uuid).groups.items()]
        unmatched = dupes.drop(best_idx)

        # Update all attributes accordingly
        self.d2_matched = self.d2_matched.drop(unmatched.index)

        self.d1_matched = self.d1_matched[~self.d1_matched[self.d1_uuid].isin(
            unmatched[self.d1_uuid])]
        self.d1_unmatched = self.d1_unmatched.append(
            self.d1[self.d1[self.d1_uuid].isin(unmatched[self.d1_uuid])])

        self.matching_key = [k for k in self.matching_key if str(
            k[self.d1_uuid]) in self.d1_matched[self.d1_uuid].astype(str).values]

    def matching_key_df(self):
        """Get a DataFrame for joining the two original datasets

        Returns:
            pandas.DataFrame: DataFrame in which each row corresponds to a facility
                match and has columns with both unique identifiers as well as matching
                method and distance apart
        """
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
        m.add_point_subset(self.d1_matched.to_crs(
            'epsg:4326'), '{} - matched'.format(d1_name), color='blue', addl_labels=addl_labels)
        m.add_point_subset(self.d2_matched.to_crs(
            'epsg:4326'), '{} - matched'.format(d2_name), color='red', addl_labels=addl_labels)
        m.add_point_subset(self.d1_unmatched.to_crs(
            'epsg:4326'), '{} - unmatched'.format(d1_name), color='purple')
        m.add_point_subset(self.d2_unmatched.to_crs(
            'epsg:4326'), '{} - unmatched'.format(d2_name), color='orange')
        m.add_connections(self.d1_matched.to_crs('epsg:4326'),
                          self.d2_matched.to_crs('epsg:4326'))

        return m


def fuzz_str(r):
    """Get a string for matching on 'properties'

    Args:
        r (dict): A row of a facility data frame

    Returns:
        str: String with all address attributes of the facility
    """
    return str({n: str(r[n]).lower() for n in [
        'HOSP10_Name',
        'Street_Addr',
        'STATE_NAME',
        'CITY_NAME',
        'ZIP_CODE',
        'COUNTY_NAME']})
