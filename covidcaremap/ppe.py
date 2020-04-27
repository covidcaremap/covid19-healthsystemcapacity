"""
PPE modeling logic. Taken from work by @Geoiy
"""

import math
import json
from collections import defaultdict
from itertools import chain

import numpy as np
import pandas as pd

DEFAULT_PARAMS = {

    # Detection Probability: Used to infer infected population from confirmed cases.
    "detection_probability": 0.14,

    # Hospitalized Rate: 0.00001 - 1.0
    "hospitalized_rate": 0.025,

    # Hospitalized Length of Stay (days)
    "hospitalized_los": 7,

    # ICU Length of Stay (days)
    "icu_los": 9,

    # ICU Rate: 0.0 - 1.0
    "icu_rate": 0.0075,

    # Ventilated Rate: 0.0 - 1.0
    "ventilated_rate": 0.005,

    #Ventilated Length of Stay (days)
    "ventilated_los": 10,

    # Shift per day for all staff
    "shifts_per_day": 2,

    # Percentage of triaged patients that are hospitalized.
    # Default considered 20% positive out of tested and 20% hospitalized out of positive.
    # 20% hospitalization from https://www.cdc.gov/mmwr/volumes/69/wr/mm6913e2.htm?mod=article_inline
    "hospitalized_to_traiged_ratio": 0.2 * 0.2

}

### STAFF ###

LAB_TECH = 'lab_tech'
NURSE = 'nurse'
MD = 'md'
EVS = 'evs'
OTHER_CLINICAL = 'other_clinical'
SECURITY = 'security'
TRANSPORT = 'transport'
PHLEBOTOMY = 'phlebotomy'

### STAGES OF CARE ###

TRIAGE = 'triage'
HOSPITALIZED = 'hospitalized'
ICU = 'icu'

### SUPPLIES ###

# Disposable
N95 = 'n95'
GOWN = 'gown'
DROPLET_MASK = 'droplet_mask'
GLOVES = 'gloves' # pairs
WIPES = 'wipes' # container
TEST_KIT = 'test_kit'

# Reusable
GOGGLES = 'goggles'
BP_CUFF_ETC = 'bp_cuff_etc' # BP Cuff, Stethoscope, Pulse Ox, Ambu Bag
VENT = 'ventilator'
PAPR = 'papr'

class SupplyCounts:
    def __init__(self, counts=None):
        if counts is None:
            self.counts = defaultdict(float)
        else:
            self.counts = defaultdict(float, counts)

    def multiply(self, x):
        result = self.copy()
        for k in result.counts:
            result.counts[k] *= x
        return result

    def add(self, other):
        result = {}
        for key in set(chain(self.counts.keys(), other.counts.keys())):
            result[key] = self.counts.get(key, 0) + other.counts.get(key, 0)
        return SupplyCounts(counts=result)

    def copy(self):
        return SupplyCounts(counts=self.counts)

    def get(self, key, default=None):
        return self.counts.get(key, default)

    def __getitem__(self, key):
        return self.counts[key]

    def __str__(self):
        return 'SupplyCounts({})'.format(json.dumps(self.counts))

class StaffSupplyModel:
    def __init__(self,
                 per_shift_counts,
                 per_encounter_counts,
                 num_patients_per,
                 encounters_per_patient):
        self.per_shift_counts = per_shift_counts
        self.per_encounter_counts = per_encounter_counts
        self.num_patients_per = num_patients_per
        self.encounters_per_patient = encounters_per_patient

class CareStageSupplyModel:
    def __init__(self,
                 per_patient,
                 per_staff):
        self.per_patient = per_patient
        self.per_staff = per_staff

SUPPLY_MODEL_PER_STAGE = {
    TRIAGE: CareStageSupplyModel(
        per_patient=SupplyCounts({ TEST_KIT: 1, DROPLET_MASK: 1}),
        per_staff={
            NURSE: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    N95: 2
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=15,
                encounters_per_patient=1
            ),
            MD: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    N95: 2,
                    GOGGLES: 1
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=30,
                encounters_per_patient=1
            ),
            EVS: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    N95: 2,
                    GOGGLES: 1
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=20,
                encounters_per_patient=1
            ),
            SECURITY: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    N95: 2,
                    GOGGLES: 1
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=50, # Estimate, "with prolonged contact"
                encounters_per_patient=1
            ),
            TRANSPORT: StaffSupplyModel(
                per_shift_counts=SupplyCounts(),
                per_encounter_counts=SupplyCounts({
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=20,
                encounters_per_patient=1
            ),
            PHLEBOTOMY: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    N95: 2,
                    GOGGLES: 1
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=300, # Estimate, "Only for blood culture, 3% of ED" - does not give staff ratio. Use 3% against the ICU rate of 10
                encounters_per_patient=1
            ),
            LAB_TECH: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    GLOVES: 7 # Add one for the "other clinical" in Lab Testing
                }),
                per_encounter_counts=SupplyCounts(),
                num_patients_per=170,
                encounters_per_patient=1
            ),
        }
    ),
    HOSPITALIZED: CareStageSupplyModel( # "Ward COVID"
        per_patient=SupplyCounts({ WIPES: 1}),
        per_staff={
            NURSE: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    GOGGLES: 2
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=2,
                encounters_per_patient=6
            ),
            MD: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    GOGGLES: 2
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=10,
                encounters_per_patient=1.2
            ),
            EVS: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    GOGGLES: 1,
                    GLOVES: 2,
                    GOWN: 2,
                    DROPLET_MASK: 2
                }),
                per_encounter_counts=SupplyCounts(),
                num_patients_per=1,
                encounters_per_patient=1
            ),
            SECURITY: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    GOGGLES: 2
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=10,
                encounters_per_patient=1
            ),
            PHLEBOTOMY: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    GOGGLES: 2
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=10,
                encounters_per_patient=1.5
            )
        }
    ),
    ICU: CareStageSupplyModel(
        per_patient=SupplyCounts({ WIPES: 1}),
        per_staff={
            NURSE: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    N95: 2,
                    GOGGLES: 2
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=2,
                encounters_per_patient=6
            ),
            MD: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    GOGGLES: 2
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=10,
                encounters_per_patient=1.2
            ),
            EVS: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    N95: 2,
                    GOGGLES: 1,
                    GLOVES: 2,
                    GOWN: 2,
                    DROPLET_MASK: 2
                }),
                per_encounter_counts=SupplyCounts(),
                num_patients_per=1,
                encounters_per_patient=1
            ),
            SECURITY: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    GOGGLES: 2
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=10,
                encounters_per_patient=1
            ),
            PHLEBOTOMY: StaffSupplyModel(
                per_shift_counts=SupplyCounts({
                    GOGGLES: 2
                }),
                per_encounter_counts=SupplyCounts({
                    GOWN: 1,
                    DROPLET_MASK: 1,
                    GLOVES: 1
                }),
                num_patients_per=10,
                encounters_per_patient=1.5
            )
        }
    )
}

def calculate_ppe_burn_for_day(new_hospitalized,
                               new_icu,
                               new_triaged=None,
                               params=None,
                               ppes=None):
    if params is None:
        params = DEFAULT_PARAMS

    if ppes is None:
        ppes = [N95, GOWN, DROPLET_MASK, GLOVES, WIPES]

    if new_triaged is None:
        # Estimate based on ratio
        new_triaged = new_hospitalized / params['hospitalized_to_traiged_ratio']

    counts = SupplyCounts()
    for key, patient_count in {
            TRIAGE: new_triaged,
            HOSPITALIZED: new_hospitalized,
            ICU: new_icu
    }.items():
        stage_model = SUPPLY_MODEL_PER_STAGE[key]
        counts = counts.add(stage_model.per_patient.multiply(patient_count))
        for staff_type, staff_model in stage_model.per_staff.items():
            staff_needed = math.ceil(patient_count / staff_model.num_patients_per)

            # Estimate staff needed to cover patients and their shift usage.
            shifts_per_day = staff_needed * params['shifts_per_day']
            counts = counts.add(
                staff_model.per_shift_counts.multiply(shifts_per_day)
            )

            # Estimate usage for number of encounters per day with patients
            encounters_per_day = staff_needed * staff_model.encounters_per_patient
            counts = counts.add(
                staff_model.per_encounter_counts.multiply(encounters_per_day)
            )

    result = dict([(ppe, math.ceil(counts.get(ppe, np.nan))) for ppe in ppes])
    return result
