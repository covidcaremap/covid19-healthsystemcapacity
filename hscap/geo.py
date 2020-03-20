import pandas as pd
import geopandas as gpd
from difflib import SequenceMatcher

from hscap.constants import *
from hscap.data import read_us_counties_gdf, read_us_states_gdf, read_us_hrr_gdf

def sum_per_region(facilities, regions, groupby_columns, population_columns=None):
    """
    Aggregate facility-level data by region via summation.

    Args:
        facilities - Facilities information in geopandas dataframe.
            Must have the columns specified in constants.py. Must be EPSG:4326
        regions - Regions to aggregate to. Must be a geopandas dataframe in EPSG:4326
        groupby_columns: Columns to group by for aggregation after spatial join.
        population_colums - Dict with keys in POPULATIONS and values being the columns of 'regions'
            that contain the population values. Defaults to the values generated in
            "Merge Region and Census Data" notebook.
    """
    if population_columns is None:
        population_columns = {
            POP_PEOPLE: 'Population',
            POP_ADULTS: 'Population (20+)',
            POP_ELDERLY: 'Population (65+)'
        }

    joined = gpd.sjoin(facilities, regions, how='inner', op='intersects')

    region_level = joined.groupby(groupby_columns, as_index='False')[
        facility_level_count_columns()
    ].sum().reset_index()

    region_level = gpd.GeoDataFrame(region_level.merge(regions), crs=4326)

    for count_column in facility_level_count_columns():
        for population in POPULATIONS:
            per_capita = region_level[count_column] / (region_level[population_columns[population]] / PER_CAPITA_BASE)
            per_capita = per_capita.round(3)
            region_level['{} [Per {} {}]'.format(count_column,
                                                 PER_CAPITA_BASE,
                                                 population)] = per_capita

    return region_level

def sum_per_county(facilities):
    return sum_per_region(facilities, read_us_counties_gdf(), groupby_columns=['STATE','COUNTY','GEO_ID'])

def sum_per_state(facilities):
    return sum_per_region(facilities, read_us_states_gdf(), groupby_columns=['STATE','GEO_ID'])

def sum_per_hrr(facilities):
    return sum_per_region(facilities, read_us_hrr_gdf(), groupby_columns=['HRR_BDRY_I'])
