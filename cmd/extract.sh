#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );

PLACEHOLDER_DATA=${PLACEHOLDER_DATA:-"./data"};

mkdir -p ${PLACEHOLDER_DATA};

echo "Creating extract at ${PLACEHOLDER_DATA}/wof.extract"

exec node --max_old_space_size=8000 ${DIR}/wof_extract_sqlite.js > ${PLACEHOLDER_DATA}/wof.extract;

echo 'Done!'
