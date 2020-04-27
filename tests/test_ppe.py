import unittest
import math
from collections import defaultdict

import numpy as np
import pandas as pd
import geopandas as gpd

from covidcaremap.ppe import (calculate_ppe_burn_for_day,
                              SUPPLY_MODEL_PER_STAGE,
                              ICU,
                              TRIAGE,
                              HOSPITALIZED,
                              DEFAULT_PARAMS,
                              N95,
                              GOWN,
                              DROPLET_MASK,
                              GLOVES,
                              WIPES)

from covidcaremap.data import (processed_data_path,
                               external_data_path,
                               local_data_path)
from covidcaremap.mapping import HospMap

from covidcaremap.merge import match_facilities, FacilityColumns

class PPETest(unittest.TestCase):
    def test_calculate_burn_works_on_small_example(self):
        new_triaged = 1
        new_hospitalized = 1
        new_icu = 1

        ppes = [N95, GOWN, DROPLET_MASK, GLOVES, WIPES]
        result = calculate_ppe_burn_for_day(new_hospitalized, new_icu, new_triaged=new_triaged, ppes=ppes)

        # Do a more manual calculation
        expected = defaultdict(float)
        for stage in [TRIAGE, HOSPITALIZED, ICU]:
            for k, v in SUPPLY_MODEL_PER_STAGE[stage].per_patient.counts.items():
                if k in ppes:
                    expected[k] += v
            for staff, staff_model in SUPPLY_MODEL_PER_STAGE[stage].per_staff.items():
                for k, v in staff_model.per_shift_counts.counts.items():
                    if k in ppes:
                        expected[k] += v * DEFAULT_PARAMS['shifts_per_day']

                for k, v in staff_model.per_encounter_counts.counts.items():
                    if k in ppes:
                        expected[k] += (v * staff_model.encounters_per_patient)

        for ppe in ppes:
            if not ppe in expected:
                expected[ppe] = np.nan
            else:
                expected[ppe] = math.ceil(expected[ppe])

        self.assertEqual(set(result.keys()), set(expected.keys()))
        for k in result.keys():
            self.assertEqual(result[k], expected[k], msg='Failed with {}'.format(k))
