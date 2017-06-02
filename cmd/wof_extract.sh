#!/bin/bash
set -euo pipefail

# directory of this file
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );

# location of whosonfirst data dir
# note: set WOF_DIR env var to override
WOF_DIR=${WOF_DIR:-'/data/whosonfirst-data/data'};

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

# parellize execution on systems which support it
XARGS_CMD='xargs';
PARALLEL_BIN=$(which parallel) || true
if [[ -f "${PARALLEL_BIN}" || -x "${PARALLEL_BIN}" ]]; then
  echo "info: using parallel execution" 1>&2;
  XARGS_CMD='parallel --no-notice --group --keep-order --jobs +0';
fi

# filter records by placetype
# removing any file names from the stream whose body does not match the pattern
function placetypeFilter {
  while IFS= read -r file; do
    grep --files-with-match -f "$DIR/placetype.filter" "$file";
  done
}

# extract only the json properies from each file (eg: excluding zs:*)
find "${WOF_DIR}" -type f -name '*.geojson' | placetypeFilter | ${XARGS_CMD} ${JQ_BIN} -c -M -f "$DIR/jq.filter";
