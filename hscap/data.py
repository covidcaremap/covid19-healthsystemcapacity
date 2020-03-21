import os
import json

import pandas as pd
import geopandas as gpd

from hscap.constants import state_name_to_abbreviation

## TODO: Replace docker locations with downloading from GitHub to some directory
## if we want to make this available outside the container.

def data_dir():
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))

def data_path(fname):
    return os.path.join(data_dir(), fname)

def read_hcris_gj():
    return json.loads(open('/opt/src/data/usa_hospital_beds_hcris2018_v2.geojson').read())

def read_facility_gj():
    return json.loads(open('/opt/src/data/ccm_data_by_facility.geojson').read())

def read_facility_gdf():
    return gpd.read_file('/opt/src/data/ccm_data_by_facility.geojson', encoding='utf-8')

def read_us_counties_gdf():
    return gpd.read_file('/opt/src/data/us_counties_with_pop.geojson', encoding='utf-8')

def read_us_states_gdf():
    df = gpd.read_file('/opt/src/data/us_states_with_pop.geojson', encoding='utf-8')
    df = df.drop(columns=['STATE'])
    df['State'] = df['NAME'].apply(lambda x: state_name_to_abbreviation[x])
    return df

def read_us_hrr_gdf():
    return gpd.read_file('/opt/src/data/us_hrr_with_pop.geojson', encoding='utf-8')

def read_census_data_df():
    return pd.read_csv('/opt/src/data/us-census-cc-est2018-alldata.csv', encoding='unicode_escape')
