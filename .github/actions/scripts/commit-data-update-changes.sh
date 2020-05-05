#!/bin/bash

set -e

if [[ -n "${COVID19_DEBUG}" ]]; then
    set -x
fi

TARGET_BRANCH=${1}

PROCESSED_DATA_DIR=data/processed
PUBLISHED_DATA_DIR=data/published

function usage() {

    echo -n \
        "Usage: $(basename "$0") CLONE_DIR
Push data update changes as part of the data update workflow.

Args:
  CLONE_DIR: The directory of the local repository to work within.
  TARGET_BRANCH: Target branch to check changes against, e.g. data/update
"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    if [ "${1:-}" = "--help" ]; then
        usage
    else
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"

        git fetch origin

        # Show what files changed
        git status ${PUBLISHED_DATA_DIR} ${PROCESSED_DATA_DIR}

        if git diff --quiet -- ${PUBLISHED_DATA_DIR} ${PROCESSED_DATA_DIR}; then
            echo "No changes to be committed to the repository."
        else
            echo "Changes found."
        fi

        if git ls-remote --exit-code origin ${TARGET_BRANCH}; then
            echo "${TARGET_BRANCH} already exists."
        else
            echo "${TARGET_BRANCH} will be created if there are data changes."
        fi

        if git diff --quiet HEAD origin/${TARGET_BRANCH} -- ${PUBLISHED_DATA_DIR} ${PROCESSED_DATA_DIR}; then
            echo "No differences found between HEAD and origin/${TARGET_BRANCH}"
        else
            git diff --compact-summary HEAD origin/${TARGET_BRANCH} -- ${PUBLISHED_DATA_DIR}
        fi

        # Only if there are diffs in the data update should we push.
        if ! git diff --quiet -- ${PUBLISHED_DATA_DIR} ${PROCESSED_DATA_DIR}; then

            # Add our target changes and commit.
            git add ${PUBLISHED_DATA_DIR} ${PROCESSED_DATA_DIR}
            git commit -m "Automatic data update for $(date -u +%Y-%m-%d)"

            if ! git ls-remote --exit-code origin ${TARGET_BRANCH} || \
                  ! git diff --quiet HEAD origin/${TARGET_BRANCH} -- ${PUBLISHED_DATA_DIR} ${PROCESSED_DATA_DIR}; then
               echo "DATA UPDATES FOUND."
               echo "::set-output name=status::CHANGED"
           else
               echo "DATA UPDATES ALREADY PUSHED."
               echo "::set-output name=status::CHANGES_ALREADY_PUSHED"
           fi
        else
            echo "NO DATA UPDATES FOUND."
            echo "::set-output name=status::NO_CHANGES"
        fi
    fi
fi
