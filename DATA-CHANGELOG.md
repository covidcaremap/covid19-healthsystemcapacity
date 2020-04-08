# Data Changelog

## v0.2

- Integrate HIFLD data
- Updated DH to 4/6/2020 version of their data.
- Manually updated 3 facilities. See the [manual override file](data/external/covidcaremap-ushcsc-facility-manual-override.csv)
- Manually match HIFLD, HCRIS and DH facilities. See the [manual match](data/external/hifld-dh-hcris-manual-matches.csv) file.
- Choose HCRIS over DH data for computation of Staffed All Beds, Staffed ICU Beds, and All Beds Occupancy Rate columns.
- Use HIFLD data for Licesened All Beds if DH data is not available.
- We used data from [this project](https://github.com/jsfenfen/covid_hospitals_demographics) to override bed counts and occupancy rates where there is data, otherwise we use our 2018 HCRIS calculations. Many thanks to Jacob Fenton.

## v0.1

Initial Release
