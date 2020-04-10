import json
from collections import ChainMap

import pandas as pd

from penn_chime.parameters import Parameters, Disposition
from penn_chime.models import RegionalSirModel

from covidcaremap.cases import get_county_case_info

DEFAULT_PARAMS = {

    # Detection Probability: Used to infer infected population from confirmed cases.
    "detection_probability": 0.14,

    # Doubling time before social distancing (days)
    "doubling_time": 4,

    # Social Distancing Reduction Rate: 0.0 - 1.0
    "relative_contact_rate": 0.3,

    # Hospitalized Rate: 0.00001 - 1.0
    "hospitalized_rate": 0.025,

    # Hospitalized Length of Stay (days)
    "hospitalized_los": 7,

    # ICU Length of Stay (days)
    "icu_rate": 0.0075,

    # ICU Rate: 0.0 - 1.0
    "icu_los": 9,

    # Ventilated Rate: 0.0 - 1.0
    "ventilated_rate": 0.005,

    # Ventilated Length of Stay (days)
    "ventilated_los": 10,

    # Infectious days
    "infectious_days": 14

}


def print_params(p):
    print(json.dumps(params_to_json(p)))


def params_to_json(p):
    def ratelos_to_json(r):
        return {'rate': r.rate, 'length_of_stay': r.length_of_stay}

    return {
        'current_hospitalized': p.current_hospitalized,
        'doubling_time': p.doubling_time,
        'known_infected': p.known_infected,
        'tested': p.tested,
        'relative_contact_rate': p.relative_contact_rate,
        'population': p.population,

        'hospitalized': ratelos_to_json(p.hospitalized),
        'icu': ratelos_to_json(p.icu),
        'ventilated': ratelos_to_json(p.ventilated),

        'market_share': p.market_share,
        'max_y_axis': p.max_y_axis,
        'n_days': p.n_days,
        'infectious_days': p.infectious_days
    }


def get_parameters_for_region(region_population,
                              region_cases,
                              region_tested,
                              region_recovered,
                              num_days=60,
                              param_override=None,
                              calculate_infected=None):
    if param_override is None:
        param_override = {}

    p = dict(ChainMap({
        # Hospital Market Share (0.00001 - 1.0)
        "market_share": 1.0,

        # Currently Known Regional Infections (>=0)
        "known_infected": region_cases,

        # Number of days to project >= 0
        "n_days": num_days,

        # Number of people tested
        "tested": region_tested,

        # Number of people to recover
        "recovered": region_recovered,

        "calculate_infected": calculate_infected

    }, DEFAULT_PARAMS, param_override))

    # None # Unused for regional calculation
    p['current_hospitalized'] = round(p['hospitalized_rate'] * region_cases)
    p['hospitalized'] = Disposition(p['hospitalized_los'],
                                    p['hospitalized_rate'])
    del p['hospitalized_rate']
    del p['hospitalized_los']

    p['icu'] = Disposition(p['icu_los'],
                           p['icu_rate'])
    del p['icu_rate']
    del p['icu_los']

    p['ventilated'] = Disposition(p['ventilated_los'],
                                  p['ventilated_rate'])
    del p['ventilated_rate']
    del p['ventilated_los']

    detection_probability = p['detection_probability']
    del p['detection_probability']

    p['population'] = region_population
    p['calculate_infected'] = calculate_infected

    chime_params = Parameters(
        **p
    )

    chime_params.detection_probability = detection_probability

    return chime_params


def get_regional_predictions(
        regions_df,
        region_id_column,
        tested_column='tested',
        population_column='Population',
        cases_column='Confirmed Cases',
        recovered_column='recovered',
        num_days=60,
        region_param_override=None,
        calculate_infected=None
):
    """Runs a regional CHIME prediction based on region population and case counts.

    Args:
        regions_df: The regions to be run over. Requires an ID, population, and cases columns.
        region_id_column: The column holding the region ID.
        tested_column: The name of the column holding the count of people who have been 
            tested. Default: 'tested'.
        population_column: The  column holding the population count. Default: 'Population'.
        cases_column: The column holding the number of confirmed cases. Default:
            'Confirmed Cases'.
        recovered_column: The name of the column holding the count of people in the
            region who have recovered. Default: 'recovered'
        num_days: Default: 60.
        region_param_override: A dictionary with keys of region IDs and values being
            being a dict of overridding values for the CHIME parameters. This allows
            regional parameters to be supplied by the user per region.

    Returns:
        A dataframe with the region_id, day, and projection numbers.
    """
    def run_row(row):
        if row[cases_column] <= 0:
            return None

        p = get_parameters_for_region(row[population_column], row[cases_column], row[tested_column],
                                      row[recovered_column], num_days=num_days, param_override=region_param_override,
                                      calculate_infected=calculate_infected)
        m = RegionalSirModel(p)
        merged = m.dispositions_df.join(m.admits_df.set_index(
            'day'), lsuffix='_total', rsuffix='_admitted')
        merged = merged.join(m.census_df.set_index(
            'day').add_suffix('_census'))
        merged = merged.dropna().round()
        merged[region_id_column] = row[region_id_column]

        # Reorder columns
        cols = list(merged.columns.values)
        cols = cols[-1:] + cols[:-1]
        merged = merged[cols]

        return merged.rename(columns={'index': 'day'})

    predictions_by_county = pd.concat(
        filter(lambda x: x is not None,
               [run_row(row[1]) for row in regions_df.iterrows()])
    )

    return predictions_by_county


def get_county_predictions(num_days=60, region_param_override=None):
    cases_by_county = get_county_case_info()
    return get_regional_predictions(cases_by_county,
                                    region_id_column='County Name')
