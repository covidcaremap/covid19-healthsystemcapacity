import math

import numpy as np
import pandas as pd
import geopandas as gpd
from difflib import SequenceMatcher
from fuzzywuzzy import fuzz

from covidcaremap.constants import *
from covidcaremap.data import read_us_counties_gdf, read_us_states_gdf, read_us_hrr_gdf

def spatial_join_facilities(left,
                            right,
                            lid_property,
                            rid_property,
                            lsimilarity_properties,
                            rsimilarity_properties,
                            similarity_weights=None,
                            distance=150,
                            dist_epsg='EPSG:5070',
                            merge_unmatched=True):
    """Spatially join two facility datasets. Full outer join - no facilitie will be
    dropped from the resulting data in case of no match.

    Args:
        left: Geopandas dataframe of facility information. Assumed that crs is set
            to EPSG:4326.
        right: Another geopandas dataframe of facility information
        lid_property: Column name for Unique ID in left
        rid_property: Column name for Unique ID in right
        lsimilarity_properties = List of column names from 'left' to be used in a similarity
            index score for deduplication.
        rsimilarity_properties = List of column names from 'right' to be used in a similarity
            index score for deduplication.
        similarity_weights: Weights to give columns above to the similarity score.
        distance: Distance in meters for spatial join. Defaults to 150m
        dist_epsg: The projection to reproject to in order to measure distancs in meters.
            Defaults to EPSG:5070 (NAD83 / Conus Albers) for the U.S.
        merge_unmatched: If True, merges in unmatched items from the right data.
            Defaults to True.

    Returns:
        A joined dataframe with two columns: lid_property and rid_property. These
        IDs are matched. There may be NaN values in either left or 'right', which
        represents unmatched.

    Notes:
        Similarity score is the weighted average of the similarity indexes from the
        similarity_property values.

        Logic taken from hifld-licensed-bed-counts-for-all-US-health-facilities from @aaronxsu
    """

    # Reproject to EPSG:5070 (NAD83 / Conus Albers)
    left = left.to_crs('EPSG:5070')
    right = right.to_crs('EPSG:5070')

    lprefix = 'left_'
    rprefix = 'right_'

    # Add prefixes
    left = left.add_prefix('{}_'.format(lprefix))
    right = right.add_prefix('{}_'.format(rprefix))
    def prefix(prefix, name):
        return '{}_{}'.format(prefix, name)

    # Reset geometry
    left['geometry'] = left[prefix(lprefix, 'geometry')]
    right['geometry'] = right[prefix(rprefix, 'geometry')]

    # Save point location to new field
    left['point_geometry'] = left['geometry']

    # Buffer
    left['geometry'] = left.buffer(distance)

    joined = gpd.sjoin(left, right, how='left', op='intersects')

    # Map columns to account for prefix
    pre_lid_property = '{}_{}'.format(lprefix, lid_property)
    pre_rid_property = '{}_{}'.format(rprefix, rid_property)
    lsimilarity_properties = ['{}_{}'.format(lprefix, p)
                              for p in lsimilarity_properties]
    rsimilarity_properties = ['{}_{}'.format(rprefix, p)
                              for p in rsimilarity_properties]

    # Deduplication - use a similarity index on name and address
    # and choose the matched item that has the highest score.
    sim_prop_len = len(lsimilarity_properties)
    assert sim_prop_len == len(rsimilarity_properties)
    if similarity_weights is None:
        similarity_weights = [1 / sim_prop_len for x in lsimilarity_properties]

    def get_similarity_score(row):
        score = 0.0
        for ((l, r), w) in zip(zip(lsimilarity_properties, rsimilarity_properties), similarity_weights):
            # For joins that don't match, right properties give float 'nan' value.
            if type(row[r]) is str:
                score += (fuzz.ratio(row[l], row[r]) * w)
        return score

    joined['similarity'] = joined.apply(get_similarity_score, axis = 1)

    joined_and_matched = joined[~joined[pre_rid_property].isnull()]
    joined_and_unmatched = joined[joined[pre_rid_property].isnull()]

    # Deduplicate left's object_ids
    deduplicated = joined_and_matched.sort_values(by=[pre_lid_property, 'similarity'], ascending=False) \
                         .drop_duplicates(subset=[pre_lid_property])

    # Deduplicate any 'right' facilities that were matched to more than one
    # 'left' facility. Do this by creating another dataframe containing the 'right'
    # facility and it's closest match, joining back with the dataframe,
    # and reseting matches on any where the identified 'left' ID isn't the same
    # as the row's 'left' ID.
    right_matches = deduplicated[[pre_rid_property, pre_lid_property, 'similarity']]
    right_matches = right_matches.sort_values(by=[pre_rid_property, 'similarity'], ascending=False)
    right_matches = right_matches.drop_duplicates(subset=[pre_rid_property])
    right_matches = right_matches.rename({pre_lid_property: 'matched_left_id'}, axis=1)
    deduplicated = deduplicated.merge(right_matches, on=pre_rid_property)
    deduplicated.loc[
        deduplicated[pre_lid_property] != deduplicated['matched_left_id'],
        pre_rid_property
    ] = np.NaN

    # Rejoin unmatched.
    deduplicated = pd.concat([deduplicated, joined_and_unmatched])

    # Join back 'right' unmatched if desired.
    if merge_unmatched:
        matched_right_ids = deduplicated[pre_rid_property]
        unmatched_right = right[~right[pre_rid_property].isin(matched_right_ids)]

        all_facilities = pd.concat([deduplicated, unmatched_right])
    else:
        all_facilities = deduplicated

    result = all_facilities.rename({ pre_lid_property: lid_property,
                                     pre_rid_property: rid_property }, axis=1)

    return result[[lid_property, rid_property]]


def sum_per_region(facilities,
                   regions,
                   groupby_columns,
                   region_id_column,
                   facility_count_columns=None,
                   facility_occupancy_columns=None,
                   population_columns=None,
                   per_capita_base=PER_CAPITA_BASE):
    """
    Aggregate facility-level data by region via summation.

    Args:
        facilities - Facilities information in geopandas dataframe.
            Must have the columns specified in constants.py. Must be EPSG:4326
        regions - Regions to aggregate to. Must be a geopandas dataframe in EPSG:4326
        groupby_columns: Columns to group by for aggregation after spatial join.
        region_id_column: ID for regions.
        facility_count_columns: The columns that should be aggregated by sum for the regional data.
            Defaults to using the columns for CovidCareMap data.
        facility_occupancy_columns: A dict of occupancy_column_name -> bed_count_column_name that will
            be used to compute the weighted average for the occupancy rate of the region. The
            bed_count_column_name will be used to compute the weight. Defaults to using the
            columns for CovidCareMap data.
        population_colums - Dict with keys in POPULATIONS and values being the columns of 'regions'
            that contain the population values. Defaults to the values generated in
            "Merge Region and Census Data" notebook.
        per_captia_base: Per capita base number. Defaults to 1000.
    """
    if population_columns is None:
        population_columns = CCM_POPULATION_COLUMNS

    if facility_count_columns is None:
        # Default to CovidCareMap columns
        facility_count_columns = CCM_FACILITY_COUNT_COLUMNS

    if facility_occupancy_columns is None:
        # Default to CovidCareMap columns
        facility_occupancy_columns = CCM_FACILITY_OCCUPANCY_COLUMNS

    joined = gpd.sjoin(facilities, regions, how='inner', op='intersects')

    compute_columns = []
    for occupancy_rate_column, beds_column in facility_occupancy_columns.items():
        w = 'weighted_{}'.format(occupancy_rate_column)
        b = 'base_{}'.format(occupancy_rate_column)
        joined[w] = joined[beds_column] * joined[occupancy_rate_column]
        joined[b] = joined[beds_column]
        joined.loc[joined[occupancy_rate_column].isnull(), b] = np.nan
        compute_columns.append(w)
        compute_columns.append(b)

    region_level = joined.groupby(groupby_columns, as_index='False')[
        facility_count_columns +
        list(facility_occupancy_columns.keys()) +
        compute_columns
    ].sum().reset_index()

    # Calculate occupancy rates via average weighted by
    # the number of beds.
    for occupancy_rate_column, beds_column in facility_occupancy_columns.items():
        region_level[occupancy_rate_column] = (
            region_level['weighted_{}'.format(occupancy_rate_column)] /
            region_level['base_{}'.format(occupancy_rate_column)]
        ).round(2)

    region_level = region_level.drop(columns=compute_columns)

    region_level = gpd.GeoDataFrame(region_level.merge(regions, on=region_id_column), crs=4326)

    for count_column in facility_count_columns:
        for population in population_columns:
            pop_column = population_columns[population]
            per_capita = region_level[count_column] / (region_level[pop_column] / per_capita_base)
            per_capita = per_capita.replace(np.inf, np.nan)
            per_capita = per_capita.round(3)
            region_level[per_capita_column_name(count_column, per_capita_base, population)] = per_capita

    return region_level

def sum_per_county(facilities):
    return sum_per_region(facilities,
                          read_us_counties_gdf(),
                          groupby_columns=['State','COUNTY','GEO_ID'],
                          region_id_column='GEO_ID')

def sum_per_state(facilities):
    if 'State' in facilities.columns:
        facilities = facilities.drop(columns=['State'])
    return sum_per_region(facilities,
                          read_us_states_gdf(),
                          groupby_columns='State',
                          region_id_column='State')

def sum_per_hrr(facilities):
    return sum_per_region(facilities,
                          read_us_hrr_gdf(),
                          groupby_columns=['HRR_BDRY_I', 'HRRCITY'],
                          region_id_column='HRRCITY')
