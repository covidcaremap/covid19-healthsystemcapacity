#!/bin/bash

set -e

if [[ -n "${COVID19_DEBUG}" ]]; then
    set -x
fi

PROCESSED_DATA_DIR=data/processed
PUBLISHED_DATA_DIR=data/published
NOTEBOOK_LOGS_DIR=notebook-logs
TMP_SUFFIX="-AAA"

function usage() {

    echo -n \
        "Usage: $(basename "$0")
Push data update changes as part of the data update workflow.
"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    if [ "${1:-}" = "--help" ]; then
        usage
    else
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"

        # Only if there are diffs in the data update should we push.
        if ! git diff --quiet ${PROCESSED_DATA_DIR} ${PUBLISHED_DATA_DIR}  && \
                git diff --staged --quiet ${PROCESSED_DATA_DIR} ${PUBLISHED_DATA_DIR}; then
            echo "DATA UPDATES FOUND."

            # Show what files changed
            git status ${PROCESSED_DATA_DIR}
            git status ${PUBLISHED_DATA_DIR}

            # Add our target changes and commit.
            git add ${NOTEBOOK_LOGS_DIR}
            git add ${PROCESSED_DATA_DIR}
            git add ${PUBLISHED_DATA_DIR}
            git commit -m "Automatic data update for $(date -u +%Y-%m-%d)"

            echo "::set-output name=status::CHANGED"
        else
            echo "NO DATA UPDATES FOUND."

            echo "::set-output name=status::NO_CHANGES"
        fi
    fi
fi
