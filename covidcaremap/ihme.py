import io
from zipfile import ZipFile

import pandas as pd
import geopandas as gpd
import requests

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
    def get_latest():
        """Gets the latest CSV file from IHME predictions"""
        url = 'https://ihmecovid19storage.blob.core.windows.net/latest/ihme-covid19.zip'
        r = requests.get(url)
        z = ZipFile(io.BytesIO(r.content))
        latest_csv_name = sorted([x.filename for x in z.filelist if x.filename.endswith('csv')])[-1]
        df = pd.read_csv(z.open(latest_csv_name))
        return df
