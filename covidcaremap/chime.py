import json
from collections import ChainMap

import pandas as pd

from penn_chime.parameters import Parameters
from penn_chime.models import RegionalSirModel
from penn_chime.utils import RateLos

from covidcaremap.cases import get_county_case_info

DEFAULT_PARAMS = {

    # Detection Probability: Used to infer infected population from confirmed cases.
    "detection_probability": 0.14,

    # Doubling time before social distancing (days)
    "doubling_time" : 4,

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

    #Ventilated Length of Stay (days)
    "ventilated_los": 10,

    "recovery_days": 14

}

def print_params(p):
    print(json.dumps(params_to_json(p)))

def params_to_json(p):
    def ratelos_to_json(r):
        return { 'rate': r.rate, 'length_of_stay': r.length_of_stay }

    return {
        'current_hospitalized': p.current_hospitalized,
        'doubling_time': p.doubling_time,
        'known_infected': p.known_infected,
        'relative_contact_rate': p.relative_contact_rate,
        'population': p.population,

        'hospitalized': ratelos_to_json(p.hospitalized),
        'icu': ratelos_to_json(p.icu),
        'ventilated': ratelos_to_json(p.ventilated),

        'as_date': p.as_date,
        'market_share': p.market_share,
        'max_y_axis': p.max_y_axis,
        'n_days': p.n_days,
        'recovery_days': p.recovery_days
    }

def get_parameters_for_region(region_population,
                              region_cases,
                              num_days=60,
                              param_override=None):
    if param_override is None:
        param_override = {}

    p = dict(ChainMap({
        # Hospital Market Share (0.00001 - 1.0)
        "market_share": 1.0,

        # Currently Known Regional Infections (>=0)
        "known_infected": region_cases,

        # Number of days to project >= 0
        "n_days": num_days,

        # Seems like a viz thing
        "as_date": False,

    }, DEFAULT_PARAMS, param_override))

    p['current_hospitalized'] = None # Unused for regional calculation

    p['hospitalized'] = RateLos(p['hospitalized_rate'],
                                p['hospitalized_los'])
    del p['hospitalized_rate']
    del p['hospitalized_los']

    p['icu'] = RateLos(p['icu_rate'],
                       p['icu_los'])
    del p['icu_rate']
    del p['icu_los']

    p['ventilated'] = RateLos(p['ventilated_rate'],
                              p['ventilated_los'])
    del p['ventilated_rate']
    del p['ventilated_los']

    detection_probability = p['detection_probability']
    del p['detection_probability']

    p['population'] = region_population

    chime_params = Parameters(
        **p
    )

    chime_params.detection_probability = detection_probability

    return chime_params

def get_regional_predictions(
        regions_df,
        region_id_column,
        population_column='Population',
        cases_column='Confirmed Cases',
        region_param_override=None
):
    """Runs a regional CHIME prediction based on region population and case counts.

    Returns:
        A dataframe with the region_id, day, and projection numbers.
    """
    def run_row(row):
        if row[cases_column] <= 0:
            return None

        p = get_parameters_for_region(row[population_column], row[cases_column])
        m = RegionalSirModel(p)
        merged = m.dispositions_df.join(m.admits_df.set_index('day'), lsuffix='_total', rsuffix='_admitted')
        merged = merged.join(m.census_df.set_index('day').add_suffix('_census'))
        merged = merged.dropna().round()
        merged[region_id_column] = row[region_id_column]
        return merged.rename(columns={'index': 'day'})

    predictions_by_county = pd.concat(
        filter(lambda x: x is not None,
               [run_row(row[1]) for row in regions_df.iterrows()])
    )

    return predictions_by_county

def get_county_predictions(region_param_override=None):
    cases_by_county = get_county_case_info()
    return get_regional_predictions(cases_by_county,
                                    region_id_column='County Name')
