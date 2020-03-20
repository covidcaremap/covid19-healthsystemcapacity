## Data Catalog

This catalogs external data sources this project uses. Note some data will be committed to the repository, while
others are too big and need to be downloaded by running the `download-external.sh` script in the data directory.

### kff_hospital_beds_per_capita.csv

Downloaded from https://www.kff.org/other/state-indicator/beds-by-ownership/?currentTimeframe=0&sortModel=%7B%22colId%22:%22Location%22,%22sort%22:%22asc%22%7D

Hospital Beds per 1,000 Population by Ownership Type

Committed to repository.

### us_counties.geojson

Source: https://eric.clst.org/tech/usgeojson/

File at https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_20m.json

Committed to repository

### us_states.geojson

Source: https://eric.clst.org/tech/usgeojson/

File at https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_040_00_20m.json

Committed to repository.

### us_hrr.geojson

Source: https://atlasdata.dartmouth.edu/static/supp_research_data#boundaries

Downloaded from https://atlasdata.dartmouth.edu/downloads/geography/hrr_bdry.zip as Shapefile.
Converted to GeoJSON via `ogr2ogr`

Committed to repository.

### us-census-cc-est2018-alldata.csv

Latest census data for population demographics by us county. See https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html

Data Description here: https://www2.census.gov/programs-surveys/popest/technical-documentation/file-layouts/2010-2018/cc-est2018-alldata.pdf

Downloaded from https://www2.census.gov/programs-surveys/popest/datasets/2010-2018/counties/asrh/cc-est2018-alldata.csv

**Not** Committed to repository. Must run `download-external.sh` in the data directory to get.
