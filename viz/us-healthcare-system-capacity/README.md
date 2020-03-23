

To generate vector tiles:

1. Install tippecanoe and mbutil if you don't already have them
2. Create a directory `input` inside the directory `data`
3. Add `us_healthcare_capacity-x-CovidCareMap.geojson` files to the `input` directory
4. `cd data`
5. Run `bash process.sh`

# CovidCareMap.org US Healthcare System Capacity

Open map data on US health system capacity to care for COVID-19 patients for all hospital facilities nationwide

Created by [@jfrankl](https://github.com/jfrankl)

## Data Processing

To generate the data necessary to run this visualization, use the [processing/07_Process_visualization_data.ipynb](../../notebooks/processing/07_Process_visualization_data.ipynb) notebook. See the [Getting Started](../../README.md#getting-started) section of the README for information about running the notebooks via Docker.
