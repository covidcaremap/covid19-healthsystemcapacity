#!/bin/bash

set -e

if [[ -n "${COVID19_DEBUG}" ]]; then
    set -x
fi

function usage() {
    echo -n \
        "Usage: $(basename "$0")
Downloads data from external sources.
"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then

    echo "Downloading census data..."
    wget -O us-census-cc-est2018-alldata.csv https://www2.census.gov/programs-surveys/popest/datasets/2010-2018/counties/asrh/cc-est2018-alldata.csv
fi
