import io
import os
from zipfile import ZipFile

import pandas as pd
import geopandas as gpd
import requests
import us

from covidcaremap.data import (read_us_states_gdf,
                               read_us_counties_gdf)

## IHME Columns

class IHME:
    LOCATION = "location_name"
    DATE = "date"

    # Hospital Census
    ALL_BEDS_PER_DAY_MEAN = "allbed_mean"
    ALL_BEDS_PER_DAY_LOWER = "allbed_lower"
    ALL_BEDS_PER_DAY_UPPER = "allbed_upper"
    ICU_BEDS_PER_DAY_MEAN = "ICUbed_mean"
    ICU_BEDS_PER_DAY_LOWER = "ICUbed_lower"
    ICU_BEDS_PER_DAY_UPPER = "ICUbed_upper"
    VENT_PER_DAY_MEAN = "InvVen_mean"
    VENT_PER_DAY_LOWER = "Inven_lower"
    VENT_PER_DAY_UPPER = "InvVen_upper"

    # Daily
    NEW_DEATHS_MEAN = "deaths_mean"
    NEW_DEATHS_LOWER = "deaths_lower"
    NEW_DEATHS_UPPER = "deaths_upper"
    NEW_HOSPITALIZED_MEAN = "admis_mean"
    NEW_HOSPITALIZED_LOWER = "admis_lower"
    NEW_HOSPITALIZED_UPPER = "admis_upper"
    NEW_ICU_MEAN = "newICU_mean"
    NEW_ICU_LOWER = "newICU_lower"
    NEW_ICU_UPPER = "newICU_upper"

    # Cumulative
    TOTAL_DEATHS_MEAN = "totdea_mean"
    TOTAL_DEATHS_LOWER = "totdea_lower"
    TOTAL_DEATHS_UPPER = "totdea_upper"

    # Capacity
    ALL_BEDS_OVER_MEAN = "bedover_mean"
    ALL_BEDS_OVER_LOWER = "bedover_lower"
    ALL_BEDS_OVER_UPPER = "bedover_upper"
    ICU_BEDS_OVER_MEAN = "icuover_mean"
    ICU_BEDS_OVER_LOWER = "icuover_lower"
    ICU_BEDS_OVER_UPPER = "icuover_upper"


    @staticmethod
    def get_latest(include_version=False):
        """Gets the latest CSV file from IHME predictions.

        Returns:
            DataFrame or Tuple[DataFrame, str]: Returns the latest results in a DataFramee.
            If include_version is True, returns a tuple with the first element being the
            dataframe of results and the second being the model version string.
        """
        url = 'https://ihmecovid19storage.blob.core.windows.net/latest/ihme-covid19.zip'
        r = requests.get(url)
        z = ZipFile(io.BytesIO(r.content))
        model_version = os.path.dirname(z.filelist[0].filename)

        latest_csv_name = [x.filename
                           for x in z.filelist
                           if x.filename.endswith('Hospitalization_all_locs.csv')][0]

        df = pd.read_csv(z.open(latest_csv_name))
        if include_version:
            return (df, model_version)
        else:
            return df

    @classmethod
    def get_latest_by_county(cls):
        """
        Gets the latest IHME predictions and disggregates them to the
        county level based on population, returns GeoDataFrame of counties.
        """
        counties = read_us_counties_gdf()
        states = read_us_states_gdf()

        state_pop = dict(zip(states['State'], states['Population']))
        counties['proportion_of_state'] = counties.apply(lambda r: r['Population'] / state_pop.get(r['State']), axis = 1)

        ihme = cls.get_latest()
        ihme = ihme[ihme['location_name'].isin([x.name  for x in us.states.STATES])].copy()
        ihme['State'] = ihme['location_name'].apply(lambda x: us.states.lookup(x).abbr)

        county_ihme = pd.merge(ihme, counties, 'inner', on='State')
        county_ihme = county_ihme.apply(lambda x: x * county_ihme['proportion_of_state'] if x.name.split('_')[-1] in ('lower', 'upper', 'mean') else x)

        return gpd.GeoDataFrame(county_ihme)
