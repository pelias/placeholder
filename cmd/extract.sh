#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );

PLACEHOLDER_DATA=${PLACEHOLDER_DATA:-"./data"};

mkdir -p ${PLACEHOLDER_DATA};

echo "Creating extract at ${PLACEHOLDER_DATA}/wof.extract"

${DIR}/wof_extract.sh > ${PLACEHOLDER_DATA}/wof.extract;

echo 'Done!'