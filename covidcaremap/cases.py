import io

import pandas as pd
import requests

from covidcaremap.data import external_data_path, processed_data_path

def get_usafacts_cases_by_county():
    url = 'https://static.usafacts.org/public/data/covid-19/covid_confirmed_usafacts.csv'
    r = requests.get(url)
    return pd.read_csv(io.BytesIO(r.content))
