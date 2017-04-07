#!/bin/bash
set -euo pipefail

# location of whosonfirst data dir
# note: set WOF_DIR env var to override
WOF_DIR=${WOF_DIR:-'/data/whosonfirst-data/data'};

# requires command: jq - Command-line JSON processor
# on ubuntu: sudo apt-get install jq

# ensure jq exists and is executable
JQ_BIN=$(which jq)
if [[ ! -f "$JQ_BIN" || ! -x "$JQ_BIN" ]]; then
  echo "jq binary not found or is not executable";
  exit 1;
fi

# extract only the json properies from each file (excluding zs:blockids)
find "$WOF_DIR" -type f -name '*.geojson' -print0 | while IFS= read -r -d $'\0' file; do
  $JQ_BIN -c -M '.properties | del(."zs:blockids")' $file;
done
