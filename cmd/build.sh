#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );

PLACEHOLDER_DATA=${PLACEHOLDER_DATA:-"./data"};

# rm -f ${PLACEHOLDER_DATA}/graph.json ${PLACEHOLDER_DATA}/store.sqlite3;

cat ${PLACEHOLDER_DATA}/wof.extract | node ${DIR}/load.js

echo 'Done!'
