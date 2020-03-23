# Notebooks for the COVIDCareMap Project

    └── notebooks              <- Jupyter notebooks.
        ├── README.md          <- This file.
        ├── requirements.txt   <- Python packages required to run notebooks.
        ├── old                <- Old notebooks such as previous versions of processing logic.
        ├── examples           <- Notebooks containing examples for using COVIDCareMap data.
        ├── processing         <- Notebooks for processing COVIDCareMap data.
        └── validation         <- Notebooks for validating COVIDCareMap data.

- [Data Processing Notebooks](#processing)
- [Validation](#Validation)
- [Examples](#examples)

**Note**: To ensure all notebooks have the data they need, make sure you run
[processing/00_Download_Data.ipynb](processing/00_Download_Data.ipynb) first.

## Data Processing Notebooks

These notebooks perform the data processing steps in order to generate the published CovidCareMap.org data
as well any other dataset produced by the project.

### Generating CovidCareMap data

![workflow](images/ccm-notebook-workflow.png)

TODO

So the data processing starts with the geocoding notebook simon did based on your geocoding
which generates a geocoded HCRIS dataset
then Process HCRIS data is next
which generates the geojson HCRIS facility data
DH data does't have to be processed since it's already geojson
so next is Merge Facility Information
which does the whole spatial joining exercise to merge the facility-level information best it can
it does that with a buffered sjoin, and then uses a similarity score (using the hilariously named FuzzyWuzzy package) between the Address and Name columns of DH and HCRIS
this step could use some work - I think we can match better and would be a source of error. It's also an interesting data science problem for someone to tackle
The merged facility information is the total input for the CCM data. Running Generate CCM facility data will give you the ccm_data_by_facility.geojson file
after that, we aggregate by region in Generate Regional CCM data

Rob Emanuele @lossyrob 01:07
oh forgot one step - Merge Region and Census Data is run before the Generate Regional CCM data notebook, which merges census data for county, state, and HRR. county and state is straightforward, for HRR, it intersects HRRs with counties and uses the area of intersection divided by area of county as the ratio of population it takes on
that's basically it for CCM data generation
There's a notebook to merge HGHI data with CCM data, HGHI with ventilators, all appropriately named

### CareModel Data

**Note:** This data is a work in progress; it is not yet totally worked out and validated. Help wanted!

TODO

### Validation

TODO

### Examples

TODO
