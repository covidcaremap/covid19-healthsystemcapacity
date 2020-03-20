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

scenarios = {
    CONVENTIONAL: {
        BEDS: {
            'field': 'ICU Total Staffed Beds',
            'ratio': 1.0,
            'surge percentage': [0.1, 0.2]
        },
        PHYSICIANS: {
            'available count ratio': 12600.0 / 81790.0,
            'patients per': [10, 15],
            'available percentage': [0.1, 0.2]
        },
        RESP_THERP: {
            'available count ratio': 112500.0 / 81790.0,
            'patients per': [4, 6],
            'available percentage': [0.1, 0.2]
        },
        NURSE: {
            'available count ratio': 503124.0 / 81790.0,
            'patients per': [1, 1],
            'available percentage': [0.1, 0.2]
        }
    },
    CONTINGENCY: {
        BEDS: {
            'field': 'ICU Total Staffed Beds',
            'ratio': 261790.0 / 81790.0,
            'surge percentage': [0.1, 0.2]
        },
        PHYSICIANS: {
            'available count ratio': 95615.0 / 81790.0,
            'patients per': [10, 15],
            'available percentage': [0.1, 0.2]
        },
        RESP_THERP: {
            'available count ratio': 112500.0 / 81790.0,
            'patients per': [7, 9],
            'available percentage': [0.1, 0.2]
        },
        NURSE: {
            'available count ratio': 503124.0 / 81790.0,
            'patients per': [2, 2],
            'available percentage': [0.1, 0.2]
        }
    },
    CRISIS: {
        BEDS: {
            'field': 'Total Staffed Beds', # Would be total licensed beds
            'ratio': 1.0,
            'surge percentage': [0.1, 0.2]
        },
        PHYSICIANS: {
            'available count ratio': 95615.0 / 81790.0,
            'patients per': [24, 24],
            'available percentage': [0.1, 0.2]
        },
        RESP_THERP: {
            'available count ratio': 112500.0 / 81790.0,
            'patients per': [4, 6],
            'available percentage': [0.1, 0.2]
        },
        NURSE: {
            'available count ratio': 503124.0 / 81790.0,
            'patients per': [1, 1],
            'available percentage': [0.1, 0.2]
        }
    }
}

def construct_beds_field_name(scenario, level):
    return 'Estimated {} Available ({}) - {}'.format(
        BEDS, scenario, level)

def construct_vents_field_name(scenario, level):
    return 'Estimated Additional {} Required ({}) - {}'.format(
        VENTS, scenario, level)

def construct_staff_field_name(scenario, staff, level):
    return '{} Required to Staff {} ({}) - {}'.format(
        staff, BEDS, scenario, level)

def facility_level_count_columns():
    """Returns the column names for facility-level counts"""
    columns = []
    for scenario in SCENARIOS:
        columns.extend([
            construct_beds_field_name(scenario, BOUND_LOWER),
            construct_beds_field_name(scenario, BOUND_UPPER),
            construct_vents_field_name(scenario, BOUND_LOWER),
            construct_vents_field_name(scenario, BOUND_UPPER),
        ])

        for staff in STAFF:
            for level in [BOUND_LOWER, BOUND_UPPER]:
                columns.append(
                    construct_staff_field_name(scenario, staff, level)
                )

    return columns
