import numpy as np
import folium
from folium import Map
from shapely.geometry import mapping


class HospMap(Map):
    def __init__(self, location=(39.8333333, -98.585522), zoom_start=4):
        super().__init__(location, zoom_start=zoom_start)
        self.has_layer_control = False

    def add_point_subset(self, gdf, name, color, label_dict):
        fg = folium.FeatureGroup(name, show=True)
        self.add_points(fg, gdf, color, label_dict=label_dict)
        self.add_child(fg)

    def add_layer_selector(self):
        self.add_child(folium.map.LayerControl(collapsed=False))

    def add_set(self, gdf1, gdf2, name, colors, lines=True, sort_col='OBJECTID', addl_labels=None):
        fg = folium.FeatureGroup(name, show=True)

        self.add_points(fg, gdf2, colors[1], addl_labels=addl_labels)
        self.add_points(fg, gdf1, colors[0], addl_labels=addl_labels)

        if lines:
            gdf1.sort_values(sort_col, inplace=True)
            gdf2.sort_values(sort_col, inplace=True)
            self.add_connecting_lines(fg, gdf1, gdf2)

        self.add_child(fg)

    def __repr__(self):
        if not self.has_layer_control:
            self.add_layer_selector()
        return ''

    @staticmethod
    def add_connecting_lines(fg, gdf1, gdf2):
        l = list(zip([i for i, _ in gdf_for_folium(gdf1)],
                     [i for i, _ in gdf_for_folium(gdf2)]))
        for ll in l:
            fg.add_child(folium.PolyLine(ll, color='grey', opacity=0.5))

    def add_connections(self, gdf1, gdf2, color='grey', name='connections'):
        fg = folium.FeatureGroup(name, show=True)
        l = list(zip([i for i, _ in gdf_for_folium(gdf1)],
                     [i for i, _ in gdf_for_folium(gdf2)]))
        for ll in l:
            fg.add_child(folium.PolyLine(ll, color=color, opacity=0.5))

        self.add_child(fg)

    @staticmethod
    def add_points(fg, gdf, color, label_dict):
        for coords, tt in gdf_for_folium(gdf, label_dict=label_dict):
            fg.add_child(folium.CircleMarker(
                coords,
                control=True,
                fill_color=color,
                fill_opacity=0.25,
                color=color,
                weight=1.5,
                tooltip=tt))


def gdf_for_folium(gdf, label_dict):
    info = []

    for _, r in gdf.iterrows():
        coords = mapping(r.geometry)['coordinates']
        coords = (coords[1], coords[0])
        props = []
        for prop in label_dict:
            val = r[label_dict[prop]]
            if type(val) is str:
                val = val.replace('`', '')
            props.append("<b>{}:</b> {}".format(prop, val))

        tooltip = '<br>'.join(props)

        info.append((coords, tooltip))

    return info


def map_facility_match_result(match_result, facility_datasets, authoritative_dataset):
    def centroid():
        xs = []
        ys = []
        for i in match_result.merged_df['geometry']:
            ys.append(i.x)
            xs.append(i.y)
        return ((np.min(xs) + ((np.max(xs) - np.min(xs)) / 2)),
                (np.min(ys) + ((np.max(ys) - np.min(ys)) / 2)))

    def get_label_dict(ds):
        columns = facility_datasets[ds]['columns']
        return {
            'Dataset': 'dataset',
            'ID': columns.facility_id,
            'Name': columns.facility_name,
            'Address': columns.street_address
        }

    merged_df = match_result.merged_df.copy()
    merged_df['dataset'] = 'Merged - {}'.format(authoritative_dataset)

    m = HospMap(centroid(), 7)
    m.add_point_subset(
        merged_df,
        '{} - matched'.format('Merged'),
        color='blue',
        label_dict=get_label_dict(authoritative_dataset)
    )

    colors = ['red', 'yellow', 'brown', 'orange', 'green']
    for i, dataset_key in enumerate(facility_datasets):
        if dataset_key in match_result.unmatched_per_dataset:
            unmatched = match_result.unmatched_per_dataset[dataset_key]
            df = facility_datasets[dataset_key]['df'].copy()
            df['dataset'] = dataset_key
            id_column = facility_datasets[dataset_key]['columns'].facility_id
            unmatched_df = df[df[id_column].astype(str).isin(unmatched)]
            m.add_point_subset(
                unmatched_df.to_crs('epsg:4326'),
                '{} - unmatched'.format(dataset_key),
                color=colors[i % len(colors)],
                label_dict=get_label_dict(dataset_key)
            )

    return m
