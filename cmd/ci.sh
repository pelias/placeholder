# Download Placeholder data for tests
BUCKET=https://data.geocode.earth/placeholder

export AGENT="github/${GITHUB_ACTOR}"
export REFERER="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}"
mkdir data
curl -A ${AGENT} -e ${REFERER} -sfo data/store.sqlite3.gz ${BUCKET}/archive/$(date +%Y-%m-%d)/store.sqlite3.gz || true
[ -e data/store.sqlite3.gz ] || curl -A ${AGENT} -e ${REFERER} -so data/store.sqlite3.gz ${BUCKET}/store.sqlite3.gz
gunzip data/store.sqlite3.gz

npm install

npm run all
