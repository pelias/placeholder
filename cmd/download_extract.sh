#!/bin/bash
set -euo pipefail

# directory of this file
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# placetypes to download and extract
PLACETYPES=( 'neighbourhood' 'macrohood' 'borough' 'locality' 'localadmin' 'county' 'macrocounty' 'region'
  'macroregion' 'disputed' 'dependency' 'country' 'empire' 'marinearea' 'continent' 'ocean' )

# download and extract fields from contents of tar
function extract {
  curl -so "/tmp/wof-${1}-latest-bundle.tar.bz2" "https://whosonfirst.mapzen.com/bundles/wof-${1}-latest-bundle.tar.bz2"
  if hash lbzip2 2>/dev/null; then
        tar --wildcards '*.geojson' -x --use-compress-program=lbzip2 --to-command 'jq -cMf "${DIR}/jq.filter"' -f "/tmp/wof-${1}-latest-bundle.tar.bz2"
    else
        tar --wildcards '*.geojson' -jx --to-command 'jq -cMf "${DIR}/jq.filter"' -f "/tmp/wof-${1}-latest-bundle.tar.bz2"
    fi
  rc=$?; if [[ $rc != 0 ]]; then
    >&2 echo "/tmp/wof-${1}-latest-bundle.tar.bz2"
    >&2 echo "command exited with status: $rc"
  fi
}

# export variables required by the 'extract' function
export -f extract
export DIR

# run the import
parallel \
  --no-notice \
  --line-buffer \
  --jobs -1 \
  extract \
  ::: "${PLACETYPES[@]}"
