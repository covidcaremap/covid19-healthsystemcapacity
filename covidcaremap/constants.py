CONVENTIONAL = 'Conventional'
CONTINGENCY = 'Contingency'
CRISIS = 'Crisis'

SCENARIOS = [CONVENTIONAL, CONTINGENCY, CRISIS]

BEDS = 'Beds'
VENTS = 'Ventilators'
PHYSICIANS = 'Physicians'
RESP_THERP = 'Respiratory Therapists'
NURSE = 'Critical Care Nurses'

STAFF = [PHYSICIANS, RESP_THERP, NURSE]

BOUND_LOWER = 'Lower'
BOUND_UPPER = 'Upper'

POP_PEOPLE = 'People'
POP_ADULTS = 'Adults (20+)'
POP_ELDERLY = 'Elderly (65+)'

PER_CAPITA_BASE = 1000

POPULATIONS = [POP_PEOPLE, POP_ADULTS, POP_ELDERLY]

CCM_POPULATION_COLUMNS = {
    POP_PEOPLE: 'Population',
    POP_ADULTS: 'Population (20+)',
    POP_ELDERLY: 'Population (65+)'
}

## CovidCareMap constants

CCM_STAFFED_BEDS_COLUMN = 'Staffed All Beds'
CCM_STAFFED_ICU_BEDS_COLUMN = 'Staffed ICU Beds'
CCM_LICENSED_BEDS_COLUMN = 'Licensed All Beds'
CCM_BED_OCCUPANCY_COLUMN = 'All Bed Occupancy Rate'
CCM_ICU_BED_OCCUPANCY_COLUMN = 'ICU Bed Occupancy Rate'

CCM_ID = 'CCM_ID'
DH_ID = 'DH-OBJECTID'
HCRIS_ID = 'HCRIS-Provider Number'

def source_column(c):
    return '{} - SOURCE'.format(c)

"""Count column names for facility-level counts"""
CCM_FACILITY_COUNT_COLUMNS = [
    CCM_STAFFED_BEDS_COLUMN,
    CCM_STAFFED_ICU_BEDS_COLUMN,
    CCM_LICENSED_BEDS_COLUMN
]

"""Occupancy column names for facility-level counts,
mapped to the bed counts they describe."""
CCM_FACILITY_OCCUPANCY_COLUMNS = {
    CCM_BED_OCCUPANCY_COLUMN: CCM_STAFFED_BEDS_COLUMN,
    CCM_ICU_BED_OCCUPANCY_COLUMN: CCM_STAFFED_ICU_BEDS_COLUMN
}

def per_capita_column_name(count_column, per_capita_base, population):
    return '{} [Per {} {}]'.format(count_column,
                                   per_capita_base,
                                   population)

CCM_PER_CAPITA_COLUMNS = [
    per_capita_column_name(count_column, PER_CAPITA_BASE, population)
    for count_column in CCM_FACILITY_COUNT_COLUMNS
    for population in POPULATIONS
]

CCM_CSV_COLUMNS = [
    'Name',
    'Hospital Type',
    'Address',
    'Address_2',
    'City',
    'State',
    'Zipcode',
    'County',
    'Latitude',
    'Longitude',
    CCM_STAFFED_BEDS_COLUMN,
    CCM_STAFFED_ICU_BEDS_COLUMN,
    CCM_LICENSED_BEDS_COLUMN,
    CCM_BED_OCCUPANCY_COLUMN,
    CCM_ICU_BED_OCCUPANCY_COLUMN,
    source_column(CCM_STAFFED_BEDS_COLUMN),
    source_column(CCM_STAFFED_ICU_BEDS_COLUMN),
    source_column(CCM_LICENSED_BEDS_COLUMN),
    source_column(CCM_BED_OCCUPANCY_COLUMN),
    source_column(CCM_ICU_BED_OCCUPANCY_COLUMN),
    CCM_ID,
    DH_ID,
    HCRIS_ID
]

## CareModel constants

def construct_beds_field_name(scenario, level=None):
    if level is None:
        return 'Estimated {} Available ({})'.format(
            BEDS, scenario)
    else:
        return 'Estimated {} Available ({}) - {}'.format(
            BEDS, scenario, level)

def construct_vents_field_name(scenario, level=None):
    if level is None:
            return 'Estimated Additional {} Required ({})'.format(
                VENTS, scenario)
    else:
        return 'Estimated Additional {} Required ({}) - {}'.format(
            VENTS, scenario, level)

def construct_staff_field_name(scenario, staff, level):
    return '{} Required to Staff {} ({}) - {}'.format(
        staff, BEDS, scenario, level)

def CAREMODEL_CAPACITY_COLUMNS():
    columns = []
    for scenario in SCENARIOS:
        columns.extend([
            construct_beds_field_name(scenario),
            construct_vents_field_name(scenario),
        ])

        for staff in STAFF:
            for level in [BOUND_LOWER, BOUND_UPPER]:
                columns.append(
                    construct_staff_field_name(scenario, staff, level)
                )

    return columns

## Other Constants

state_name_to_abbreviation = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
}
