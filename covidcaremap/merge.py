from collections import defaultdict
from functools import reduce
import folium
import geopandas as gpd
import libpysal
import numpy as np
import pandas as pd
import networkx as nx
from libpysal.cg import fast_knn
from scipy.spatial.distance import euclidean
from shapely.geometry import MultiPoint
from shapely.ops import nearest_points
from sklearn.preprocessing import normalize

from covidcaremap.geo import spatial_join_facilities
from covidcaremap.mapping import HospMap
from rapidfuzz import fuzz

class FacilityMatchResult:
    """Contains the match results from the "match_facilities" method.

    Args:
        merged_df [GeoDataFrame]: The dataframe containing all merged information from each match.
            This dataframe will have columns in the authoritative dataset. For
            each non-authoritative dataset, the column names will be prefixed by the dataset key,
            e.g. if 'hcris' is the key, the column in this dataframe woudl be 'hcris_HOSP10_Name'.
        matches_df [DataFrame]: A dataframe only containing the ID columns for each dataset with
            matched facilities.
        unmatched_per_dataset: A dict keyed by dataset key that contains the IDs of unmatched facilities.
    """
    def __init__(self,
                 merged_df,
                 matches_df,
                 unmatched_per_dataset):
        self.merged_df = merged_df
        self.matches = matches_df
        self.unmatched_per_dataset = unmatched_per_dataset

    def get_unmatched_dict(self):
        """Returns a dict that can be serialized into JSON for the unmatched ids per dataset."""
        result = {}
        for dataset_key in self.unmatched_per_dataset:
            result[dataset_key] = list(self.unmatched_per_dataset[dataset_key])
        return result

class FacilityColumns:
    """This class represents the column names for a DataFrame
    that describe the information necessary to perform matching."""

    def __init__(self,
                 facility_id,
                 facility_name,
                 street_address):
        self.facility_id = facility_id
        self.facility_name = facility_name
        self.street_address = street_address


def match_facilities(facility_datasets,
                     authoritative_dataset,
                     max_distance=150,
                     nearest_n=10,
                     meters_crs='epsg:5070',
                     reducer_fn=None):
    """Matches facilities. The dataset represented by the authoritative_dataset key
    in the facilities_dfs dict will considered authoritative - all other facilities
    in the remaining datasets will be dropped if they are not matched, and the point
    location of the authoritative dataset will be used.

    Args:
        facility_datasets (Dict[str, Dict]): A dictionary keyed by
            the dataset ID with values being a dictionary containing keys
            'df' containing the dataframe of facility data and 'columns'
            containing a FacilityColumns object.
        authoritative_dataset: The dataset that contains the facilities all
            other datasets will match to.
        max_distance (int, optional): The maximum distance (in meters) that two matches can be apart.
            Defaults to 150 meters.
        nearest_n (int, optional): The number of neighbors to consider as potential options.
            Defaults to 10.
        meters_crs: The EPSG code for the projection to use for meters distance computations.
            Defaults to EPSG:5070 (NAD83 / Conus Albers) for the U.S.
        reducer_fn: Function to reduce potentially matched facilities. Defaults to
            reduce_matched_facility_records. See that function's signature for required
            parameters. Pass in alternate implementations to implement other matching approaches.

    Result:
        (FacilityMatchResult): The result of the match.

    Note:
        The resulting dataframes will convert the id columns of any dataset into a str type.
    """
    if reducer_fn is None:
        reducer_fn = reduce_matched_facility_records

    def get_id_column(dataset_key):
        return facility_datasets[dataset_key]['columns'].facility_id

    def get_matched_set(s):
        """Method for collecting the data for the reducer_fn based on a
        connected subcomponent. Returns the records of the matched set and a dictionary
        that records the distances between the facilities.
        """

        records = []
        distances = {}
        for n in s:
            ds, facility_id = deconstruct_match_id(n)
            df = facility_datasets[ds]['df']
            id_column = facility_datasets[ds]['columns'].facility_id
            record = df[df[id_column].astype(str) == facility_id].to_dict(orient='record')[0]
            record['dataset'] = ds
            record['match_id'] = n
            records.append(record)

            for u, v in G.edges(n):
                distances[(u, v)] = G.get_edge_data(u, v)['weight']

        return records, distances

    assert authoritative_dataset in facility_datasets

    # check that dataset ID columns are unique
    dataset_id_columns = [
        get_id_column(dataset_key)
        for dataset_key in facility_datasets
    ]
    if len(set(dataset_id_columns)) != len(dataset_id_columns):
        raise Exception('Dataset ID column names must be unique.')

    # Setup a distinct order of datasets
    dataset_order = [authoritative_dataset] + sorted([x for x in facility_datasets
                                                    if x != authoritative_dataset])

    ids = []
    pts = []
    ids_to_pts = {}

    MATCH_ID_SEP = '_-_'

    def deconstruct_match_id(match_id):
        return match_id.split(MATCH_ID_SEP)

    # Construct a reprojected geodataframe per dataset, and
    # record the match ids and points for usage in the KNN
    # computation below.
    for dataset_key in dataset_order:
        df = facility_datasets[dataset_key]['df']
        meters_df = df.to_crs(meters_crs)
        id_column = get_id_column(dataset_key)
        meters_df['match_id'] = '{}{}'.format(dataset_key, MATCH_ID_SEP) + \
                                          meters_df[id_column].astype(str)
        facility_datasets[dataset_key]['meters_df'] = meters_df

        for _, row in meters_df.iterrows():
            match_id = row['match_id']
            pt = (row['geometry'].x, row['geometry'].y)
            ids_to_pts[match_id] = pt
            ids.append(match_id)
            pts.append(pt)

    # Compute the K Nearest Neighbors for all points in the dataset.
    kd_tree = libpysal.cg.KDTree(np.array(pts))
    nearest_neighbors = libpysal.weights.KNN(kd_tree, k=nearest_n, ids=ids).neighbors

    # For every match, make an edge in a graph. Don't add an edge between
    # points that are further than the max distance. The weight of the edge
    # is the distance between them in meters.
    G = nx.Graph()
    for match_id in nearest_neighbors:
        source_pt = ids_to_pts[match_id]
        G.add_node(match_id)
        for neighbor_id in nearest_neighbors[match_id]:
            neighbor_pt = ids_to_pts[neighbor_id]
            dist = euclidean(source_pt, neighbor_pt)
            if  dist <= max_distance and not G.has_edge(match_id, neighbor_id):
                G.add_edge(match_id, neighbor_id, weight=dist)

    # Set up a dict to be turned into the matches dataframe,
    # and a dict that tracks what non-authoritative datasets
    # have been matched.
    matches = {}
    matched_ids = {}
    for dataset_key in dataset_order:
        matches[get_id_column(dataset_key)] = []
        if dataset_key != authoritative_dataset:
            matched_ids[dataset_key] = set([])

    dataset_columns = dict([(k, facility_datasets[k]['columns']) for k in facility_datasets])

    # Iterate over connected components, which gives us the subgraphs that are
    # matched, and pass this into the reduce_matches method to
    # reduce down each match to a single matched set.
    for s in nx.connected_components(G):
        # Ignore components that don't have a point from the authoritative dataset.
        if authoritative_dataset in [deconstruct_match_id(m)[0] for m in s]:
            records, distances = get_matched_set(s)
            if len(records) == 1:
                reduced_components = [[records[0]['match_id']]]
            else:
                authoritative_records = [r for r in records if r['dataset'] == authoritative_dataset]
                records_to_match = [r for r in records if r['dataset'] != authoritative_dataset]
                reduced_components = reducer_fn(authoritative_records,
                                                records_to_match,
                                                distances,
                                                dataset_columns)

            for match_set in reduced_components:
                # Ensure that the set has a facility from the authoritative datatset
                assert authoritative_dataset in [deconstruct_match_id(match_id)[0]
                                                 for match_id in match_set]

                ds_ids = {}
                for m in match_set:
                    dataset_key, facility_id = deconstruct_match_id(m)
                    ds_ids[dataset_key] = facility_id
                    if dataset_key != authoritative_dataset:
                        matched_ids[dataset_key].add(facility_id)

                for dataset_key in dataset_order:
                    col = get_id_column(dataset_key)
                    if not dataset_key in ds_ids:
                        matches[col].append(None)
                    else:
                        matches[col].append(ds_ids[dataset_key])

    # Construct the FacilityMatchResult and return
    matches_df = pd.DataFrame.from_dict(matches)

    unmatched_per_dataset = {}
    for dataset_key in matched_ids:
        ids = set(facility_datasets[dataset_key]['df'][get_id_column(dataset_key)].astype(str).values)
        unmatched_per_dataset[dataset_key] = ids - matched_ids[dataset_key]

    # Merge the dataframes, using the geometry from the authoritative dataset and
    # prefixing all but the ID columns by the dataset ID.
    merged_df = matches_df
    for dataset_key in dataset_order:
        df = facility_datasets[dataset_key]['df']
        id_column = get_id_column(dataset_key)
        if dataset_key != authoritative_dataset:
            df_prefixed = df.copy().add_prefix('{}_'.format(dataset_key))
            df_prefixed = df_prefixed.rename(columns={'{}_{}'.format(dataset_key, id_column): id_column})
            df_prefixed = df_prefixed.drop(columns=['{}_geometry'.format(dataset_key)])
        else:
            df_prefixed = df.copy()

        df_prefixed[id_column] = df_prefixed[id_column].astype(str)

        merged_df = merged_df.merge(df_prefixed, on=id_column, how='left')

    merged_df = gpd.GeoDataFrame(merged_df, crs='epsg:4326')

    return FacilityMatchResult(merged_df, matches_df, unmatched_per_dataset)

def reduce_matched_facility_records(authoritative_records,
                                    records_to_match,
                                    distances, dataset_columns):
    """Subset a set of facility records that are near each other.

    Implementations can override this to implement their own matching approaches.
    Records contain all fields from the dataset dataframe as well as
    a 'match_id', which is the ID that contains the dataset information as well,
    and a 'dataset' which is the dataset identifier.

    Args:
        authoritative_records (List[Dict]): The records for the facilities
            from the authoritative dataset.
        records_to_match(List[Dict]):
        distances (Dict[(Str, Str),Float]): The distance in meters between any two records.
            Use the "match_id" in the records as a tuple to get the distance between those two records.
        dataset_columns (Dict[Str, Dict]): The column name information for each dataset.

    Returns:
        List[List[Str]]: List of match sets and the match reason.
        Each element in the list is a tuple who's first elemeent is the list of
        "match_id"s for facilities that are matched to each other. Each final match set in the
        list should not contain any duplicate IDs from the same dataset and should contain at least
        one ID from the authoritative dataset.
    """
    def address_could_match(address1, address2):
        """Returns true if these addresses could match.
        Returns false if the mailbox number is different between the two
        """
        parts1 = address1.split(' ')
        parts2 = address2.split(' ')

        if parts1[0].isnumeric() and parts2[0].isnumeric():
            return int(parts1[0]) == int(parts2[0])
        else:
            return True

    result = []
    match_records_by_dataset = defaultdict(list)
    for record in records_to_match:
        match_records_by_dataset[record['dataset']].append(record)

    # List of (source_id, dataset_key, dest_id, name_score, address_score)
    scored_edges = []

    # Determine if each source record may be a match with the records
    # from non-authoritative datasets. If so, assign a score based on
    # the name and address columns, and add to scored_edges.
    for source_record in authoritative_records:
        source_id = source_record['match_id']

        source_name_column = dataset_columns[source_record['dataset']].facility_name
        source_address_column = dataset_columns[source_record['dataset']].street_address

        source_name = source_record[source_name_column]
        source_address = source_record[source_address_column]

        for dataset_key in match_records_by_dataset:
            dest_name_column = dataset_columns[dataset_key].facility_name
            dest_address_column = dataset_columns[dataset_key].street_address

            dest_records = match_records_by_dataset[dataset_key]
            for dest_record in dest_records:
                dest_id = dest_record['match_id']
                dest_name = dest_record[dest_name_column]

                might_match = False

                # Check to see if the address make this match unreasonable
                address_possible = address_could_match(source_address, dest_record[dest_address_column])

                if address_possible:
                    might_match = True
                else:
                    # If the address don't match, only consider it if the names match exactly.
                    if source_name.lower() == dest_name.lower():
                        might_match = True

                if might_match:
                    name_score = fuzz.ratio(source_name, dest_name)
                    address_score = fuzz.ratio(source_address, dest_record[dest_address_column])

                    scored_edges.append((source_id, dataset_key, dest_id, name_score, address_score))

    matched_to_source = defaultdict(dict)
    matched_by_ds = defaultdict(list)

    # Assign matches based on the highest scores.
    # Go through the scored edges in descending order and assign matches
    # if there remaining matches available based on what has been previously
    # matched and only matching a single facility from a dataset_key.
    sorted_scored_edges = sorted(scored_edges, key=lambda e: (e[3], e[4]), reverse=True)
    for source_id, dataset_key, dest_id, _, _ in sorted_scored_edges:
        # Don't take this edge if the dest_id is already matched
        if dest_id not in matched_by_ds[dataset_key]:
            source_matches = matched_to_source[source_id]
            # Don't take this edge if the source_id is already matched to this dataset
            if dataset_key not in source_matches:
                source_matches[dataset_key] = dest_id
                matched_by_ds[dataset_key].append(dest_id)

    # Create match sets for each source record.
    for source_record in authoritative_records:
        source_id = source_record['match_id']
        # Match set at least contains the authoritative source.
        match_set = set([source_id])
        if source_id in matched_to_source:
            match_set = match_set.union(set([matched_to_source[source_id][ds]
                                             for ds in matched_to_source[source_id]]))
        result.append(match_set)

    return result
