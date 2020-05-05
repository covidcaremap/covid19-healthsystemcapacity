#!/bin/bash

set -e

if [[ -n "${COVID19_DEBUG}" ]]; then
    set -x
fi

function usage() {
    echo -n \
        "Usage: $(basename "$0")
Process data for CovidCareMap.
"
}

NOTEBOOKS_TO_RUN=(
    "processing/Process_IHME_data.ipynb"
)

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    mkdir -p notebook-logs

    for notebook in "${NOTEBOOKS_TO_RUN[@]}"; do
        echo
        echo "==RUNNING ${notebook}=="
        echo


        mkdir -p notebook-logs/$(dirname $notebook)
        papermill \
            notebooks/${notebook} \
            notebook-logs/${notebook}
    done
fi
