#!/bin/bash
set -euo pipefail

# directory of this file
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );
DATA_DIR="${DIR}/../data";
BUCKET='s3://pelias-data/placeholder/';

echo '--- gzip data files ---';
if type pigz >/dev/null
  then
    pigz -k -c --best "${DATA_DIR}/graph.json" > "${DATA_DIR}/graph.json.gz";
    pigz -k -c --best "${DATA_DIR}/store.sqlite3" > "${DATA_DIR}/store.sqlite3.gz";
    pigz -k -c --best "${DATA_DIR}/wof.extract" > "${DATA_DIR}/wof.extract.gz";
  else
    gzip -c --best "${DATA_DIR}/graph.json" > "${DATA_DIR}/graph.json.gz";
    gzip -c --best "${DATA_DIR}/store.sqlite3" > "${DATA_DIR}/store.sqlite3.gz";
    gzip -c --best "${DATA_DIR}/wof.extract" > "${DATA_DIR}/wof.extract.gz";
fi

echo '--- upload files to s3 ---';
aws s3 cp "${DATA_DIR}/graph.json.gz" "${BUCKET}" --acl public-read;
aws s3 cp "${DATA_DIR}/store.sqlite3.gz" "${BUCKET}" --acl public-read;
aws s3 cp "${DATA_DIR}/wof.extract.gz" "${BUCKET}" --acl public-read;

echo '--- list files ---';
aws s3 ls --human-readable "${BUCKET}";
# 2017-05-05 15:19:08   13.3 MiB graph.json.gz
# 2017-05-05 15:19:48   43.2 MiB store.sqlite3.gz
# 2017-05-05 15:20:30   46.0 MiB wof.extract.gz
