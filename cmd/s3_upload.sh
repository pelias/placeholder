#!/bin/bash
set -euo pipefail

# directory of this file
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
DATA_DIR=${PLACEHOLDER_DATA:-"${DIR}/../data"}
BUCKET='s3://pelias-data.nextzen.org/placeholder'
TODAY=`date +%Y-%m-%d`

echo '--- gzipping data files ---'
if type pigz >/dev/null
  then
    pigz -k -c --best "${DATA_DIR}/store.sqlite3" > "${DATA_DIR}/store.sqlite3.gz"
    pigz -k -c --best "${DATA_DIR}/wof.extract" > "${DATA_DIR}/wof.extract.gz"
  else
    gzip -c --best "${DATA_DIR}/store.sqlite3" > "${DATA_DIR}/store.sqlite3.gz"
    gzip -c --best "${DATA_DIR}/wof.extract" > "${DATA_DIR}/wof.extract.gz"
fi

echo '--- uploading archive ---'
aws s3 cp "${DATA_DIR}/store.sqlite3.gz" "${BUCKET}/archive/${TODAY}/store.sqlite3.gz" --region us-east-1 --acl public-read
aws s3 cp "${DATA_DIR}/wof.extract.gz" "${BUCKET}/archive/${TODAY}/wof.extract.gz" --region us-east-1 --acl public-read

echo '--- list remote archive ---'
aws s3 ls --human-readable "${BUCKET}/archive/${TODAY}/"

echo -e "\n> would you like to promote this build to production (yes/no)?"
read answer

if [ "$answer" == "yes" ] || [ "$answer" == "y" ]; then
  echo '--- promoting build to production ---'
  aws s3 cp "${BUCKET}/archive/${TODAY}/store.sqlite3.gz" "${BUCKET}/store.sqlite3.gz" --region us-east-1 --acl public-read
  aws s3 cp "${BUCKET}/archive/${TODAY}/wof.extract.gz" "${BUCKET}/wof.extract.gz" --region us-east-1 --acl public-read

  echo '--- list remote production files ---'
  aws s3 ls --human-readable "${BUCKET}/"
else
  echo 'you did not answer yes, the build was not promoted to production'
fi
