import json

import pandas as pd
import geopandas as gpd

## TODO: Replace docker locations with downloading from GitHub to some directory
## if we want to make this available outside the container.

def read_hcris_gj():
    return json.loads(open('/opt/src/data/usa_hospital_beds_hcris2018_v2.geojson').read())

def read_facility_gj():
    return json.loads(open('/opt/src/data/hscap_data_by_facility.geojson').read())

def read_facility_gdf():
    return gpd.read_file('/opt/src/data/hscap_data_by_facility.geojson', encoding='utf-8')

def read_us_counties_gdf():
    return gpd.read_file('/opt/src/data/us_counties_with_pop.geojson', encoding='utf-8')

def read_us_states_gdf():
    return gpd.read_file('/opt/src/data/us_states_with_pop.geojson', encoding='utf-8')

def read_us_hrr_gdf():
    return gpd.read_file('/opt/src/data/us_hrr_with_pop.geojson', encoding='utf-8')

def read_census_data_df():
    return pd.read_csv('/opt/src/data/us-census-cc-est2018-alldata.csv', encoding='unicode_escape')
