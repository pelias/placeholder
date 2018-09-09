#!/bin/bash
set -euo pipefail

# directory of this file
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );

# location of whosonfirst data dir
# note: set WOF_DIR env var to override
WOF_DIR=${WOF_DIR:-'/data/whosonfirst-data/data'};

# Set number of cores used by xargs. Default is host number of cpu cores
NB_CORES=${NB_CORES:-$(getconf _NPROCESSORS_ONLN)}

# requires command: jq - Command-line JSON processor
# on ubuntu: sudo apt-get install jq

# requires version jq 1.5 or later, for older versions of ubunutu:
# sudo apt-get remove jq
# sudo apt-get install libonig2
# wget http://de.archive.ubuntu.com/ubuntu/pool/universe/j/jq/jq_1.5+dfsg-1_amd64.deb
# sudo dpkg -i jq_1.5+dfsg-1_amd64.deb

# ensure jq exists and is executable
JQ_BIN=$(which jq) || true
if [[ ! -f "${JQ_BIN}" || ! -x "${JQ_BIN}" ]]; then
  echo "jq binary not found or is not executable" 1>&2;
  exit 1;
fi

XARGS_CMD="xargs -n 1 -P ${NB_CORES}";

# filter records by placetype
# removing any file names from the stream whose body does not match the pattern
function placetypeFilter {
  while IFS= read -r FILENAME; do
    grep --files-with-match -f "${DIR}/placetype.filter" "${FILENAME}" || true;
  done
}

# extract only the json properies from each file (eg: excluding zs:*)
# note: excludes 'alt' geometeries
find "${WOF_DIR}" -type f -name '*.geojson' |\
  grep -E '/[0-9]+\.geojson$' |\
  placetypeFilter |\
  ${XARGS_CMD} ${JQ_BIN} -c -M -f "${DIR}/jq.filter";
