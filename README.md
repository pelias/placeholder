
## natural language parser for geographic text

This engine takes unstructured input text, such as 'Neutral Bay North Sydney New South Wales' and attempts to deduce the geographic area the user is referring to.

Human beings (familiar with Australian geography) are able to quickly scan the text and establish that there 3 distinct token groups: 'Neutral Bay', 'North Sydney' & 'New South Wales'.

The engine uses a similar technique to our brains, scanning across the text, cycling through a dictionary of learned terms and then trying to establish logical token groups.

Once token groups have been established, a reductive algorithm is used to ensure that the token groups are logical in a geographic context. We don't want to return New York City for a term such as 'nyc france', so we need to only return things called 'nyc' *inside* places called 'france'.

The engine starts from the rightmost group, and works to the left, ensuring token groups represent geographic entities contained *within* those which came before. This process is repeated until it either runs out of groups, or would return 0 results.

The best estimation is then returned, either as a set of integers representing the ids of those regions, or as a JSON structure which also contains additional information such as population counts etc.

The data is sourced from the [whosonfirst](https://github.com/whosonfirst-data/whosonfirst-data) project, this project also includes different language translations of place names.

Placeholder supports searching on and retrieving tokens in different languages and also offers support for synonyms and abbreviations.

---

[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/placeholder.svg)](https://greenkeeper.io/)

## install

```bash
$ git clone git@github.com:pelias/placeholder.git && cd placeholder
$ npm install
```

### download the required database files

```bash
$ mkdir data
$ curl -s http://pelias-data.s3.amazonaws.com/placeholder/store.sqlite3.gz | gunzip > data/store.sqlite3;
```

### confirm the build was successful

```bash
$ npm test
```

```bash
$ npm run cli -- san fran

> pelias-placeholder@1.0.0 cli
> node cmd/cli.js "san" "fran"

san fran

search: 3ms
 - 85922583	locality 	San Francisco
```

---

## run server

```bash
$ PORT=6100 npm start;
```

### open browser

the server should now be running and you should be able to access the http API:

```bash
http://localhost:6100/
```

try the following paths:

```javascript
/demo
/parser/search?text=london
/parser/findbyid?ids=101748479
/parser/query?text=london
/parser/tokenize?text=sydney new south wales
```

### changing languages

the `/parser/search` endpoint accepts a `?lang=xxx` property which can be used to vary the language of data returned.

for example, the following urls will return strings in Japanese / Russian where available:

```javascript
/parser/search?text=germany&lang=jpn
/parser/search?text=germany&lang=rus
```

documents returned by `/parser/search` contain a boolean property named `languageDefaulted` which indicates if the service was able to find a translation in the language you request (false) or whether it returned the default language (true).

the demo is also able to serve responses in different languages by providing the language code in the URL anchor:

```bash
/demo#jpn
/demo#chi
/demo#eng
/demo#fra
... etc.
```

---

## run the interactive shell

```bash
$ npm run repl

> pelias-placeholder@1.0.0 repl
> node cmd/repl.js

placeholder >
```

try the following commands:

```javascript
placeholder > london on
 - 101735809	locality 	London

placeholder > search london on
 - 101735809	locality 	London

placeholder > tokenize sydney new south wales
 [ [ 'sydney', 'new south wales' ] ]

placeholder > token kelburn
 [ 85772991 ]

placeholder > id 85772991
 { name: 'Kelburn',
   placetype: 'neighbourhood',
   lineage:
    { continent_id: 102191583,
      country_id: 85633345,
      county_id: 102079339,
      locality_id: 101915529,
      neighbourhood_id: 85772991,
      region_id: 85687233 },
   names: { eng: [ 'Kelburn' ] } }

placeholder > edges 85632473
 [ 85675251,
   85675259,
   85675261,
   85681309,
   421182667,
   421188405,
   890430305,
   890441225,
   890441463 ]
```

---

## configuration for pelias API

While Placeholder can be used as a stand-alone application or included with other geographic software / search engines, it is designed for the [Pelias geocoder](https://github.com/pelias/pelias).

To connect Placeholder service to the Pelias API, [configure the pelias config file](https://github.com/pelias/api#pelias-config) with the port that placeholder is running on.

---

## tests

### run the test suite

```bash
$ npm test
```

### run the functional cases

there are more exhaustive test cases included in `test/cases/`.

to run all the test cases:

```bash
$ npm run funcs
```

### generate a ~500,000 line test file

this command requires the `data/wof.extract` file mentioned below in the 'building the database' section.

```bash
$ npm run gentests
```

once complete you can find the generated test cases in `test/cases/generated.txt`.

---

## docker

### build the service image

```bash
$ docker-compose build
```

### run the service in the background

```bash
$ docker-compose up -d
```

---

## building the database

### prerequisites
- jq 1.5+ must be installed
    - on ubuntu: `sudo apt-get install jq`
    - on mac: `brew install jq`
- Who's on First data download
    - use the download script in [pelias/whosonfirst](https://github.com/pelias/whosonfirst#downloading-the-data)

### steps
the database is created from geographic data sourced from the [whosonfirst](https://whosonfirst.mapzen.com/) project.

the whosonfirst project is distributed as geojson files, so in order to speed up development we first extract the relevant data in to a file: `data/wof.extract`.

the following command will iterate over all the `geojson` files under the `WOF_DIR` path, extracting the relevant properties in to the file `data/wof.extract`.

this process can take 30-60 minutes to run and consumes ~350MB of disk space, you will only need to run this command once, or when your local `whosonfirst-data` files are updated.

```bash
$ WOF_DIR=/data/whosonfirst-data/data npm run extract
```

alternatively you can download the extract file from our s3 bucket:

```bash
$ mkdir data
$ curl -s http://pelias-data.s3.amazonaws.com/placeholder/wof.extract.gz | gunzip > data/wof.extract
```

now you can rebuild the `data/store.json` file with the following command:

this should take 2-3 minutes to run:

```bash
$ npm run build
```

---

## publishing

### rebuild the image

you can rebuild the image on any system with the following command:

```bash
$ docker build -t mapzen/pelias-placeholder .
```

### push image

if you have push access you can upload your new image to dockerhub:

```bash
$ docker push mapzen/pelias-placeholder
```

---

### uploading a new build to s3

this section is applicable to mapzen employees only and requires s3 credentials and the `aws` command to be installed and configured prior to running.

other organizations may elect to change the bucket name in the config and utilize the same script.

the script takes care of creating a date stamped archive and promoting the most recent build to the root of the bucket (with a public ACL).

```bash
$ ./cmd/s3_upload.sh

--- gzipping data files ---
--- uploading archive ---
upload: data/store.sqlite3.gz to s3://pelias-data/placeholder/archive/2017-09-29/store.sqlite3.gz
upload: data/wof.extract.gz to s3://pelias-data/placeholder/archive/2017-09-29/wof.extract.gz
--- list remote archive ---
2017-09-29 14:52:33   46.6 MiB store.sqlite3.gz
2017-09-29 14:53:08   53.8 MiB wof.extract.gz

> would you like to promote this build to production (yes/no)?
no
you did not answer yes, the build was not promoted to production
```
