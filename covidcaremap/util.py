import io

import pandas as pd
import requests

def fetch_df(url):
    """Fetches a Pandas DataFrame from a remote source"""
    r = requests.get(url)
    return pd.read_csv(io.BytesIO(r.content))
