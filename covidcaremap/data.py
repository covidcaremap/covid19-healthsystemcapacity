import os
import io
import json
from zipfile import ZipFile

import pandas as pd
import geopandas as gpd
import requests

from covidcaremap.constants import state_name_to_abbreviation
from covidcaremap.util import fetch_df

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))

EXTERNAL_DATA_DIR = os.path.abspath(os.path.join(DATA_DIR, 'external'))
PROCESSED_DATA_DIR = os.path.abspath(os.path.join(DATA_DIR, 'processed'))
PUBLISHED_DATA_DIR = os.path.abspath(os.path.join(DATA_DIR, 'published'))
LOCAL_DATA_DIR = os.path.abspath(os.path.join(DATA_DIR, 'local'))

def external_data_path(fname):
    """Make data path for data sourced externally from CovidCareMap.org"""
    return os.path.join(EXTERNAL_DATA_DIR, fname)

def processed_data_path(fname):
    """Make data path for data processed by CovidCareMap.org"""
    return os.path.join(PROCESSED_DATA_DIR, fname)

def published_data_path(fname):
    """Make data path for data published by CovidCareMap.org"""
    return os.path.join(PUBLISHED_DATA_DIR, fname)

def local_data_path(fname):
    """Make data path for data that is not committed to the repository"""
    if not os.path.isdir(LOCAL_DATA_DIR):
        os.makedirs(LOCAL_DATA_DIR)
    return os.path.join(LOCAL_DATA_DIR, fname)

def data_path(fname):
    return os.path.join(DATA_DIR, fname)

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

def get_ihme_forecast():
    """Gets the latest CSV file from IHME predictions"""
    url = 'https://ihmecovid19storage.blob.core.windows.net/latest/ihme-covid19.zip'
    r = requests.get(url)
    z = ZipFile(io.BytesIO(r.content))
    latest_csv_name = sorted([x.filename for x in z.filelist if x.filename.endswith('csv')])[-1]
    df = pd.read_csv(z.open(latest_csv_name))
    return df
