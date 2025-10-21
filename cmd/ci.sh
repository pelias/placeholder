# Download Placeholder data for tests
BUCKET=https://data.geocode.earth/placeholder

export AGENT="github/${GITHUB_ACTOR}"
export REFERER="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}"

if [ ! -e data/store.sqlite3 ]; then
  # ensure data directory exists
  mkdir -p data

  # attempt to download today's data first, fall back to latest if not found
  echo "Downloading placeholder data..."
  curl -A "${AGENT}" -e "${REFERER}" -sfo data/store.sqlite3.gz ${BUCKET}/$(date +%Y-%m-%d)/store.sqlite3.gz || true
  [ -e data/store.sqlite3.gz ] || curl -A "${AGENT}" -e "${REFERER}" -so data/store.sqlite3.gz ${BUCKET}/store.sqlite3.gz

  # decompress the sqlite database
  echo "Decompressing placeholder data..."
  gunzip -f data/store.sqlite3.gz
fi

# check sqlite3 version
sqlite3 --version

# install npm dependencies
npm install

# run all tests
npm run all
