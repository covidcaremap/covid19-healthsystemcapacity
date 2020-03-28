import io

import pandas as pd
import requests

from covidcaremap.data import external_data_path, processed_data_path

import geopandas as gpd

USAFACTS_CASES_URL = ('https://static.usafacts.org/public/data/covid-19/'
                      'covid_confirmed_usafacts.csv')

USAFACTS_DEATHS_URL = ('https://static.usafacts.org/public/data/covid-19/'
                       'covid_deaths_usafacts.csv')


def get_usafacts_cases_by_county():
    r = requests.get(USAFACTS_CASES_URL)
    return pd.read_csv(io.BytesIO(r.content))

def get_usafacts_deaths_by_county():
    r = requests.get(USAFACTS_DEATHS_URL)
    return pd.read_csv(io.BytesIO(r.content))

def get_county_case_info():
    """Generates confirmed cases and deaths information per county, merged with population data
    in a geodataframe. This pulls from the latest files at
    https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/
    """
    def get_latest_case_info(url, column_name):
        r = requests.get(url)
        df = pd.read_csv(io.BytesIO(r.content))
        per_county_counts = df[df.columns[-1]]
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
