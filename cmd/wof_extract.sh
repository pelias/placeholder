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
JQ_BIN=$(which jq)
if [[ ! -f "$JQ_BIN" || ! -x "$JQ_BIN" ]]; then
  echo "jq binary not found or is not executable";
  exit 1;
fi

# extract only the json properies from each file (eg: excluding zs:*)
find "$WOF_DIR" -type f -name '*.geojson' | xargs $JQ_BIN -c -M -f "$DIR/jq.filter";
