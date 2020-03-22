import os
import json

import pandas as pd
import geopandas as gpd

from covidcaremap.constants import state_name_to_abbreviation

def data_dir():
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))

def external_data_dir():
    """Data directory for data sourced externally from CovidCareMap.org"""
    return os.path.abspath(os.path.join(data_dir(), 'external'))

def external_data_path(fname):
    """Make data path for data sourced externally from CovidCareMap.org"""
    return os.path.join(external_data_dir(), fname)

def processed_data_dir():
    """Data directory for data processed by CovidCareMap.org"""
    return os.path.abspath(os.path.join(data_dir(), 'processed'))

def processed_data_path(fname):
    """Make data path for data processed by CovidCareMap.org"""
    return os.path.join(processed_data_dir(), fname)

def published_data_dir():
    """Data directory for data published by CovidCareMap.org"""
    return os.path.abspath(os.path.join(data_dir(), 'published'))

def published_data_path(fname):
    """Make data path for data published by CovidCareMap.org"""
    return os.path.join(published_data_dir(), fname)

def data_path(fname):
    return os.path.join(data_dir(), fname)

def read_hcris_gj():
    return json.loads(open(processed_data_path('usa_hospital_beds_hcris2018.geojson')).read())

def read_facility_gj():
    return json.loads(open(published_data_path('us_healthcare_capacit-facility-CovidCareMap.geojson')))

def read_facility_gdf():
    return gpd.read_file(published_data_path('us_healthcare_capacity-facility-CovidCareMap.geojson'),
                         encoding='utf-8')

def read_us_counties_gdf():
    return gpd.read_file(processed_data_path('us_counties_with_pop.geojson'), encoding='utf-8')

def read_us_states_gdf():
    df = gpd.read_file(processed_data_path('us_states_with_pop.geojson'), encoding='utf-8')
    return df

def read_us_hrr_gdf():
    return gpd.read_file(processed_data_path('us_hrr_with_pop.geojson'), encoding='utf-8')

def read_census_data_df():
    return pd.read_csv(external_data_path('us-census-cc-est2018-alldata.csv'), encoding='unicode_escape')
