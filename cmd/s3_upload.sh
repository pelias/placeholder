#!/bin/bash
set -euo pipefail

# directory of this file
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );
DATA_DIR=${PLACEHOLDER_DATA:-"${DIR}/../data"};
BUCKET='s3://pelias-data/placeholder/';
TODAY=`date +%Y-%m-%d`;

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
aws s3 cp "${DATA_DIR}/graph.json.gz" "${BUCKET}" --region us-east-1 --acl public-read;
aws s3 cp "${DATA_DIR}/store.sqlite3.gz" "${BUCKET}" --region us-east-1 --acl public-read;
aws s3 cp "${DATA_DIR}/wof.extract.gz" "${BUCKET}" --region us-east-1 --acl public-read;

echo '--- create archive ---';
aws s3 cp "${BUCKET}graph.json.gz" "${BUCKET}archive/${TODAY}/graph.json.gz" --region us-east-1 --acl public-read;
aws s3 cp "${BUCKET}store.sqlite3.gz" "${BUCKET}archive/${TODAY}/store.sqlite3.gz" --region us-east-1 --acl public-read;
aws s3 cp "${BUCKET}wof.extract.gz" "${BUCKET}archive/${TODAY}/wof.extract.gz" --region us-east-1 --acl public-read;

echo '--- list files ---';
aws s3 ls --human-readable "${BUCKET}";

echo '--- list archive files ---';
aws s3 ls --human-readable "${BUCKET}archive/${TODAY}/";
