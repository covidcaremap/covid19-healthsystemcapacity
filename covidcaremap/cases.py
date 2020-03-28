import pandas as pd

from covidcaremap.data import external_data_path, processed_data_path
from covidcaremap.util import fetch_df

import geopandas as gpd

USAFACTS_CASES_URL = ('https://static.usafacts.org/public/data/covid-19/'
                      'covid_confirmed_usafacts.csv')

USAFACTS_DEATHS_URL = ('https://static.usafacts.org/public/data/covid-19/'
                       'covid_deaths_usafacts.csv')

NYTIMES_COUNTY_URL = ('https://github.com/nytimes/covid-19-data/raw/master/us-counties.csv')
NYTIMES_STATE_URL = ('https://github.com/nytimes/covid-19-data/raw/master/us-states.csv')


def get_usafacts_cases_by_county():
    return fetch_df(USAFACTS_CASES_URL)

def get_usafacts_deaths_by_county():
    return fetch_df(USAFACTS_DEATHS_URL)

def get_nytimes_cases_by_county():
    return fetch_df(NYTIMES_COUNTY_URL)

def get_nytimes_cases_by_state():
    return fetch_df(NYTIMES_STATE_URL)

def get_county_case_info(date=None):
    """Generates confirmed cases and deaths information per county, merged with population data
    in a geodataframe. This pulls from the latest files at
    https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/

    Args:
        date: Date in MM/DD/YY format (same as USAFacts column names). Use None to get latest.
    """
    def get_latest_case_info(url, column_name):
        df = fetch_df(url)
        col = df.columns[-1]
        if date is not None:
            if not date in df.columns:
                raise Exception('Date {} not in dataset or not in proper format'.format(date))
            col = date
        per_county_counts = df[col]
        df['{} Last Updated'.format(column_name)] = df.columns[-1]
        df[column_name] = per_county_counts
        return df[
            [
                'countyFIPS',
                'County Name',
                'State',
                'stateFIPS',
                column_name,
                '{} Last Updated'.format(column_name)
            ]
        ]

    latest_confirmed = get_latest_case_info(
        USAFACTS_CASES_URL,
        'Confirmed Cases')

    latest_deaths = get_latest_case_info(
        USAFACTS_DEATHS_URL,
        'Deaths')

    county_cases = latest_confirmed[
        ['countyFIPS',
         'Confirmed Cases',
         'Confirmed Cases Last Updated'
        ]
    ].merge(latest_deaths[
        ['countyFIPS',
         'Deaths',
         'Deaths Last Updated'
        ]
    ])

    # Read in processed pop data. Requires that the notebook to generate has been run
    # "Merge Region and Census Data"
    counties = gpd.read_file(processed_data_path('us_counties_with_pop.geojson'))
    counties['countyFIPS'] = counties['COUNTY_FIPS'].astype(int)

    return counties.merge(county_cases, on='countyFIPS').drop(columns=['countyFIPS'])
