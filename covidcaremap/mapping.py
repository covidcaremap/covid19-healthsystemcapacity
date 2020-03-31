import folium
from folium import Map
from shapely.geometry import mapping


def gdf_for_folium(gdf, addl_labels=None):
    info = []

    for _, r in gdf.iterrows():
        coords = mapping(r.geometry)['coordinates']
        coords = (coords[1], coords[0])
        name = "<b>Name:</b> {}".format(r['HOSP10_Name'])
        addr = "<b>Addr:</b> {}".format(r['Street_Addr'])
        state = "<b>State:</b> {}".format(r['STATE_NAME'])
        county = "<b>County:</b> {}".format(r['COUNTY_NAME'])
        city = "<b>City:</b> {}".format(r['CITY_NAME'])
        zip_code = "<b>Zip Code:</b> {}".format(r['ZIP_CODE'])
        if 'distance' in r and r['distance']:
            x = round(float(r['distance']))
        else:
            x = 'N/A'
        distance = "<b>Distance discrepancy:</b> {} meters".format(x)

        g_source = "<b>Geocode source:</b> {}".format(
            'geocoded:' + r['source'] if 'source' in r else 'original')
        c_source = "<b>Validation source:</b> {}".format(
            r['confirmation_source'] if 'confirmation_source' in r else 'N/A')

        tooltip = '<br>'.join(
            [name, addr, state, county, city, zip_code, distance, g_source, c_source])
        
        if addl_labels:
            for al in addl_labels:
                tooltip += '<br><b>{}</b>: {}'.format(al, r[al])

        info.append((coords, tooltip))

    return info


class HospMap(Map):
    def __init__(self, location=(39.8333333,-98.585522), zoom_start=4):
        super().__init__(location, zoom_start=zoom_start)
        self.has_layer_control = False

    def add_point_subset(self, gdf, name, color, addl_labels=None):
        fg = folium.FeatureGroup(name, show=True)
        self.add_points(fg, gdf, color, addl_labels=addl_labels)
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
            self.add_connecting_lines(fg, gdf1, gdf2, addl_labels=addl_labels)

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
    def add_points(fg, gdf, color, addl_labels=None):
        for coords, tt in gdf_for_folium(gdf, addl_labels=addl_labels):
            fg.add_child(folium.CircleMarker(
                coords,
                control=True,
                fill_color=color,
                fill_opacity=0.25,
                color=color,
                weight=1.5,
                tooltip=tt))
