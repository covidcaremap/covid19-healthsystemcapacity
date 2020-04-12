import numpy as np
import folium
from folium import Map
from shapely.geometry import mapping


class HospMap(Map):
    def __init__(self, location=(39.8333333, -98.585522), zoom_start=4):
        super().__init__(location, zoom_start=zoom_start)
        self.has_layer_control = False

    def save(self, file, **kwargs):
        self.add_layer_selector()
        super().save(file, **kwargs)
        
    def add_point_subset(self, gdf, name, color, label_dict):
        fg = folium.FeatureGroup(name, show=True)
        self.add_points(fg, gdf, color, label_dict=label_dict)
        self.add_child(fg)

    def add_layer_selector(self):
        if not self.has_layer_control:
            self.add_child(folium.map.LayerControl(collapsed=False))
            self.has_layer_control = True

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
            fg.add_child(folium.PolyLine(ll, color='grey', opacity=0.75))

    def add_connections(self, gdf1, gdf2, color='grey', name='connections'):
        fg = folium.FeatureGroup(name, show=True)
        l = list(zip([i for i, _ in gdf_for_folium(gdf1)],
                     [i for i, _ in gdf_for_folium(gdf2)]))
        for ll in l:
            fg.add_child(folium.PolyLine(ll, color=color, opacity=0.75))

        self.add_child(fg)

    @staticmethod
    def add_points(fg, gdf, color, label_dict):
        for coords, tt in gdf_for_folium(gdf, label_dict=label_dict):
            coords = [float(x) for x in coords]
            fg.add_child(folium.CircleMarker(
                coords,
                control=True,
                fill_color=color,
                fill_opacity=0.50,
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
            try:
                val = r[label_dict[prop]]
            except KeyError:
                import pdb
                pdb.set_trace()
                print()
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
        df = match_result.merged_df.copy()
        # contiguous US
        df = df[df['STATE'].isin(['FL', 'WA', 'CA', 'ME'])]
        for i in df['geometry']:
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

    label_dict = get_label_dict(authoritative_dataset)
        
    # Add info on the facilities that matched to HIFLD data
    for k in match_result.unmatched_per_dataset.keys():
        columns = facility_datasets[k]['columns']
        label_dict['{}-ID'.format(k)] = '{}'.format(columns.facility_id)
        label_dict['{}-Name'.format(k)] = '{}_{}'.format(k, columns.facility_name)
        label_dict['{}-Address'.format(k)] = '{}_{}'.format(k, columns.street_address)

    m = HospMap(centroid(), 5)

    merged_df = match_result.merged_df
    matching_layers = {}
    for k, _ in facility_datasets.items():
        if k != authoritative_dataset:
            matching_layers[k] = merged_df[facility_datasets[k]['columns'].facility_id].notnull().values
    
    n_matches = np.add.reduce(np.array([v for v in matching_layers.values()]))
    one_match = np.where(n_matches == 1, True, False)

    for k, v in matching_layers.items():
        matching_layers[k] = np.logical_and(one_match, v)

    layers = {}
    layers['all'] = np.where(n_matches == len(matching_layers), True, False)
    layers['none'] = np.where(n_matches == 0, True, False)
    layers.update(matching_layers)
    colors = [('#00688B', '#00688B'),
              ('#84C0D4', '#84C0D4'),
              ('#B3432B	', '#E9B0A4	'),
              ('#694489', '#C5B0D8'),
              ('#487153', '#B2CEBA')]

    for i, d in enumerate(layers.items()):
        dataset_key, matched_indices = d
        matched_color, unmatched_color = colors[i]
        matched = merged_df[matched_indices].copy()
        matched['dataset'] = authoritative_dataset
        if dataset_key != 'none':
            m.add_point_subset(
                matched,
                '{} - matched'.format(dataset_key),
                color=matched_color,
                label_dict=label_dict
            )

        if dataset_key == 'all':
            continue
        if dataset_key == 'none':
            dataset_key = authoritative_dataset
            unmatched_df = merged_df[matched_indices].copy()
        elif dataset_key in match_result.unmatched_per_dataset:
            unmatched = match_result.unmatched_per_dataset[dataset_key]
            df = facility_datasets[dataset_key]['df'].copy()
            id_column = facility_datasets[dataset_key]['columns'].facility_id
            unmatched_df = df[df[id_column].astype(str).isin(unmatched)].copy()
        else:
            continue

        unmatched_df['dataset'] = dataset_key
        m.add_point_subset(
            unmatched_df.to_crs('epsg:4326'),
            '{} - unmatched'.format(dataset_key),
            color=unmatched_color,
            label_dict=get_label_dict(dataset_key)
        )

    return m
