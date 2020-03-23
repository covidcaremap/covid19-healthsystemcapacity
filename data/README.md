# Data Catalog

A catalog of all data used in the project.

    └── data
        ├── README.md          <- This file.
        ├── external           <- Intermediate data that has been transformed.
        ├── published          <- The final, canonical data sets for COVIDCareMap.
        └── processed          <- Folder containing intermediate processing data.

## Published Datasets

| File                                                 | Description                                                                   |
|------------------------------------------------------|-------------------------------------------------------------------------------|
| [us_healthcare_capacity-facility-CovidCareMap.geojson](published/us_healthcare_capacity-facility-CovidCareMap.geojson) | Capacity information for US Health Facilities in GeoJSON format.                                |
| [us_healthcare_capacity-facility-CovidCareMap.csv](published/us_healthcare_capacity-facility-CovidCareMap.csv) | Capacity information for US Health Facilities in CSV format.                                |
| [us_healthcare_capacity-county-CovidCareMap.geojson](published/us_healthcare_capacity-county-CovidCareMap.geojson)   | Aggregated facility capacity information by County in GeoJSON format.                           |
| [us_healthcare_capacity-county-CovidCareMap.csv](published/us_healthcare_capacity-county-CovidCareMap.csv)   | Aggregated facility capacity information by County in CSV format.                           |
| [us_healthcare_capacity-state-CovidCareMap.geojson](published/us_healthcare_capacity-state-CovidCareMap.geojson)    | Aggregated facility capacity information by State in GeoJSON format.                            |
| [us_healthcare_capacity-state-CovidCareMap.csv](published/us_healthcare_capacity-state-CovidCareMap.csv)    | Aggregated facility capacity information by State in CSV format.                            |
| [us_healthcare_capacity-hrr-CovidCareMap.geojson](published/us_healthcare_capacity-hrr-CovidCareMap.geojson)      | Aggregated facility capacity information by Healthcare Referral Region (HRR) in GeoJSON format. |
| [us_healthcare_capacity-hrr-CovidCareMap.csv](published/us_healthcare_capacity-hrr-CovidCareMap.csv)      | Aggregated facility capacity information by Healthcare Referral Region (HRR) in CSV format. |


The 'published' directory contains datasets published by CovidCareMap. These are data that
have been aggregated from various sources, analyzed, processed, inspected for validity and
written to common data formats for easy consumption.

**IMPORTANT NOTE**: This data may be updated. If you want to pull directly from links where the data does not change, see the note in the main README about [Using Tags](../README.md#using-tags)

### CovidCareMap Healthcare System Capacity data

This data aggregates information about the healthcare system capacity. It sources data from
the [Healthcare Cost Report Information System (HCRIS)](#healthcare-cost-report-information-system-hcris-data) and
an open dataset by [Definitive Healthcare](#definitive-health-dh-data).

##### CovidCareMap Capcity Data Dictionary

These fields are across all facility and regional datasets:

- **Name**: Name of the facility, same as Definitive Healthcare data.

- **Hospital Type**: Hospital Type from Definititve Healthcare data. See [Hospital Types](#hospital-type)

- **Address**, **Address_2**, **City**, **State**, **Zipcode**, **County**, **Latitude**, **Longitude**: Location information from the Definitive Healthcare data.

- **Staffed All Beds** - Number of hospital beds of all types typically set up and staffed for inpatient care as reported/estimated in selected facility or area

- **Staffed ICU Beds** - Number of ICU beds typically set up and staffed for intensive inpatient care as reported/estimated in selected facility or area

- **Licensed All Beds** - Number of hospital beds of all types licensed for potential use in selected facility or area

- **All Bed Occupancy Rate** - % of hospital beds of all types typically occupied by patients in selected facility or area

- **ICU Bed Occupancy Rate** - % of ICU beds typically occupied by patients in selected facility or area

- **CCM_ID** - Unique identifier for the facility. Matches the Definitive Healtchare ID until other datasets are brought in.

- **DH-OBJECTID** - The `OBJECTID` in the Definitive Healtchare dataset for this facility.

- **HCRIS-Provider Number** - The `Provider Number` from the HCRIS reports (also matches the `PROVIDER_NUMBER` field
in the facility information).

There are additional per-capita fields in the regional datasets:

- **Population** - Population of this region, sourced by the US Census Bureau 2018 county population estimates.

- **Population (20+)** - Population of people aged 20 years or older.

- **Population (65+)** - Population of people aged 65 years or older.

- **Staffed All Beds [Per 1000 People]**, **Staffed All Beds [Per 1000 Adults (20+)]**, **Staffed All Beds [Per 1000 Elderly (65+)]**, etc. - The `Staffed All Beds`, `Staffed ICU Beds`, and `Licensed All Beds` fields per capita of the population described.

There is additional information about [estimated mechanical ventilators](#ventilator-data) for state-level data:

- **Estimated No. Full-Featured Mechanical Ventilators**
- **Estimated No. Full-Featured Mechanical Ventilators per 100,000 Population**
- **Estimated No. Pediatrics-Capable Full-Feature Mechanical Ventilators**
- **Estimated No. Full-Feature Mechanical Ventilators, Pediatrics Capable per 100,000 Population <14**

##### Hospital Types

This information directly from the [esri page for the data](https://coronavirus-resources.esri.com/datasets/definitivehc::definitive-healthcare-usa-hospital-beds?geometry=162.949%2C-16.820%2C172.090%2C72.123)

- Short Term Acute Care Hospital (STAC)
  - Provides inpatient care and other services for surgery, acute medical conditions, or injuries
  - Patients care can be provided overnight, and average length of stay is less than 25 days
- Critical Access Hospital (CAH)
  - 25 or fewer acute care inpatient beds
  - Located more than 35 miles from another hospital
  - Annual average length of stay is 96 hours or less for acute care patients
  - Must provide 24/7 emergency care services
  - Designation by CMS to reduce financial vulnerability of rural hospitals and improve access to healthcare
- Religious Non-Medical Health Care Institutions
  - Provide nonmedical health care items and services to people who need hospital or skilled nursing facility care, but for whom that care would be inconsistent with their religious beliefs
- Long Term Acute Care Hospitals
  - Average length of stay is more than 25 days
  - Patients are receiving acute care - services often include respiratory therapy, head trauma treatment, and pain management
- Rehabilitation Hospitals
  - Specializes in improving or restoring patients' functional abilities through therapies
- Children’s Hospitals
  - Majority of inpatients under 18 years old
- Psychiatric Hospitals
  - Provides inpatient services for diagnosis and treatment of mental illness 24/7
  - Under the supervision of a physician
- Veteran's Affairs (VA) Hospital
  - Responsible for the care of war veterans and other retired military personnel
  - Administered by the U.S. VA, and funded by the federal government
- Department of Defense (DoD) Hospital

#### US Healthcare Capacity by Facility

##### Files

- [us_healthcare_capacity-facility-CovidCareMap.geojson](published/us_healthcare_capacity-facility-CovidCareMap.geojson): Data in [GeoJSON](https://geojson.org/) format.
- [us_healthcare_capacity-facility-CovidCareMap.csv](published/us_healthcare_capacity-facility-CovidCareMap.csv): Data in CSV format.





## External Datasets

### Downloading Data

Note that some data will be committed to
the repository, while others are too big and need to be downloaded by running
the [Download_Data.ipynb](../notebooks/processing/Download_Data.ipynb) notebook.
You must download all the project data to ensure all notebooks run.

- [Published Datasets](#published-datasets)
- [External Datasets](#external-datasets)
- [Processed Datasets](#processed-datasets)

### Health System Data

#### Healthcare Cost Report Information System (HCRIS) Data

CMS Healthcare Cost Report Information System (HCRIS): https://www.cms.gov/Research-Statistics-Data-and-Systems/Downloadable-Public-Use-Files/Cost-Reports/Hospital-2010-form

This include hospital facility information and facility cost reports.

Sources:
- http://downloads.cms.gov/files/hcris/hosp10-reports.zip
- https://www.cms.gov/files/zip/hospital2010-documentation.zip
- http://downloads.cms.gov/Files/hcris/HOSP10FY2018.zip

**Note** Not committed to repository. See [Downloading Data](#downloading-data)

##### FILES

- **HCRIS-HOSPITAL10_PROVIDER_ID_INFO.CSV**: Facility level IDs, names and addresses.
- **HCRIS-HCRIS_DataDictionary.csv**: Data dictionary with report column mappings.
- **HCRIS-hosp10_2018_RPT.CSV**: HCRIS report data for 2018.
- **HCRIS-hosp10_2018_NMRC.CSV**: Numeric column information for the HCRIS report data.

#### Harvard Global Health Institute (HGHI) Data

This data was collected from the Harvard Global Health Institute (HGHI) study described here: https://globalepidemics.org/2020/03/17/caring-for-covid-19-patients/

##### FILES

- [HGHI - Hospital Capacity by State.csv](: Exported from https://docs.google.com/spreadsheets/d/1XUVyZF3X_4m72ztFnXZFvDKn5Yys1aKgu2Zmefd7wVo/edit?usp=sharing
- **HGHI - HRR Scorecard - 60% Population.csv** - Exported from https://docs.google.com/spreadsheets/d/1xAyBFTrlxSsTKQS7IDyr_Ah4JLBYj6_HX6ijKdm4fAY/edit?usp=sharing
- **HGHI - HRR Scorecard - 40% Population.csv** - Exported from https://docs.google.com/spreadsheets/d/1xAyBFTrlxSsTKQS7IDyr_Ah4JLBYj6_HX6ijKdm4fAY/edit?usp=sharing
- **HGHI - HRR Scorecard - 20% Population.csv** - Exported from https://docs.google.com/spreadsheets/d/1xAyBFTrlxSsTKQS7IDyr_Ah4JLBYj6_HX6ijKdm4fAY/edit?usp=sharing

#### Definitive Health (DH) Data

Data generated by Definitive Health, who is [opening up their data](https://blog.definitivehc.com/news/definitive-healthcare-esri-geomapping-covid19) for COVID-19 relief (thank you!!!). Definitive Health acquired Billian's HealthDATA in 2016; Billian's is the database referenced in the paper [Assessing the capacity of the healthcare system to use additional mechanical ventilators during a large-scale public health emergency](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4636910/) which we are hoping to use to model capacity under different capacity levels (Conventional, Contingency, Crisis).

##### FILES

- **dh_facility_data.geojson**: [Source](https://coronavirus-resources.esri.com/datasets/definitivehc::definitive-healthcare-usa-hospital-beds?geometry=125.859%2C-16.820%2C-150.821%2C72.123) US Facility data. This data was converted from a Shapefile to GeoJSON via `ogr2ogr`

#### Homeland Infrastructure Foundation-Level Data (HIFLD)

From https://hifld-geoplatform.opendata.arcgis.com/datasets/hospitals.

> This feature class/shapefile contains locations of Hospitals for 50 US states, Washington D.C., US territories of Puerto Rico, Guam, American Samoa, Northern Mariana Islands, Palau, and Virgin Islands. The dataset only includes hospital facilities based on data acquired from various state departments or federal sources which has been referenced in the SOURCE field. Hospital facilities which do not occur in these sources will be not present in the database. The source data was available in a variety of formats (pdfs, tables, webpages, etc.) which was cleaned and geocoded and then converted into a spatial database. The database does not contain nursing homes or health centers. Hospitals have been categorized into children, chronic disease, critical access, general acute care, long term care, military, psychiatric, rehabilitation, special, and women based on the range of the available values from the various sources after removing similarities. In this update the TRAUMA field was populated for 172 additional hospitals and helipad presence were verified for all hospitals.

##### Files

- **hifld-hospitals.csv**: [Source](https://opendata.arcgis.com/datasets/6ac5e325468c4cb9b905f1728d6fbf0f_0.csv) HIFLD facility data

#### Ventilator Data

Source: https://www.cambridge.org/core/journals/disaster-medicine-and-public-health-preparedness/article/mechanical-ventilators-in-us-acute-care-hospitals/F1FDBACA53531F2A150D6AD8E96F144D

Rubinson, L., Vaughn, F., Nelson, S., Giordano, S., Kallstrom, T., Buckley, T., . . . Branson, R. (2010). Mechanical Ventilators in US Acute Care Hospitals. Disaster Medicine and Public Health Preparedness, 4(3), 199-206. doi:10.1001/dmp.2010.18

From spreadsheet constructed by Dave Luo: https://docs.google.com/spreadsheets/d/1IDeFJJ1Kq5fXAp5vR_Fqp1jtf_4qjqqfeha5BsKUGe8/edit#gid=891030621

##### Files

- **ventilators_by_state.csv**: Ventilators by state. From spreadsheet constructed by Dave Luo: https://docs.google.com/spreadsheets/d/1IDeFJJ1Kq5fXAp5vR_Fqp1jtf_4qjqqfeha5BsKUGe8/edit#gid=891030621


#### Kaiser Family Foundation data

Hospital Beds per 1,000 Population by Ownership Type

Downloaded from https://www.kff.org/other/state-indicator/beds-by-ownership/?currentTimeframe=0&sortModel=%7B%22colId%22:%22Location%22,%22sort%22:%22asc%22%7D


##### FILES

- **kff_hospital_beds_per_capita_by_state.csv**: State-level hospital bed data.

### Geospatial Information

#### County Boundaries

Source: https://eric.clst.org/tech/usgeojson/

##### FILES

- **us_counties.geojson**: From https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_20m.json


#### State Boundaries

Source: https://eric.clst.org/tech/usgeojson/

##### FILES

- **us_states.geojson**: From https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_040_00_20m.json

#### Hospital Referral Region (HRR) Boundaries

Hospital Referral Regions (HRRs) represent regional health care markets for tertiary medical care.

Source: https://atlasdata.dartmouth.edu/static/supp_research_data#boundaries

#### Zip Code Convex hulls

Generated by Simon Kassel. TODO: Describe source, generate with notebook.

##### FILES

- **us_zip_codes-convex_hulls.geojson**: The zip code geojson file for the whole US was prohibitively large so we reduced the size by simplifying the polygons into their [convex hulls](https://en.wikipedia.org/wiki/Convex_hull). This dramatically reduced the file size while keeping enough spatial information for the simple task of validating basic location.

##### FILES

- **us_hrr.geojson**: Downloaded from https://atlasdata.dartmouth.edu/downloads/geography/hrr_bdry.zip as Shapefile. Converted to GeoJSON via `ogr2ogr`

### Population Data

#### US Census Data

For county level data: Latest census data for population demographics by us county. See https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html

Puerto Rico populations taken from [Puerto Rico Commonwealth Population by Characteristics: 2010-2019](https://www.census.gov/data/tables/time-series/demo/popest/2010s-detail-puerto-rico.html)

##### FILES

- **us-census-cc-est2018-alldata.csv**: County level data. [Data Description](https://www2.census.gov/programs-surveys/popest/technical-documentation/file-layouts/2010-2018/cc-est2018-alldata.pdf). Downloaded from https://www2.census.gov/programs-surveys/popest/datasets/2010-2018/counties/asrh/cc-est2018-alldata.csv
- **PEP_2018_PEPAGESEX_with_ann.csv**: State level data including Puerto Rico. Downloaded from https://www2.census.gov/programs-surveys/popest/tables/2010-2018/state/asrh/PEP_2018_PEPAGESEX.zip

**Note** County level data is not committed to repository. See [Downloading Data](#downloading-data)

## Processed Datasets

### HCRIS data

#### HCRIS-usa_hospital_beds_hcris2018.geojson

Produce by the notebook [Process HCRIS Data.ipynb](../notebooks/processing/).
