>This repository is part of the [Pelias](https://github.com/pelias/pelias)
>project. Pelias is an open-source, open-data geocoder originally sponsored by
>[Mapzen](https://www.mapzen.com/). Our official user documentation is
>[here](https://github.com/pelias/documentation).

# Pelias Placeholder Service
[![NPM](https://nodei.co/npm/pelias-placeholder.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-placeholder)
[![Build Status](https://travis-ci.org/pelias/placeholder.png?branch=master)](https://travis-ci.org/pelias/placeholder)
[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/placeholder.svg)](https://greenkeeper.io/)

## natural language parser for geographic text

This engine takes unstructured input text, such as 'Neutral Bay North Sydney New South Wales' and attempts to deduce the geographic area the user is referring to.

Human beings (familiar with Australian geography) are able to quickly scan the text and establish that there 3 distinct token groups: 'Neutral Bay', 'North Sydney' & 'New South Wales'.

The engine uses a similar technique to our brains, scanning across the text, cycling through a dictionary of learned terms and then trying to establish logical token groups.

Once token groups have been established, a reductive algorithm is used to ensure that the token groups are logical in a geographic context. We don't want to return New York City for a term such as 'nyc france', so we need to only return things called 'nyc' *inside* places called 'france'.

The engine starts from the rightmost group, and works to the left, ensuring token groups represent geographic entities contained *within* those which came before. This process is repeated until it either runs out of groups, or would return 0 results.

The best estimation is then returned, either as a set of integers representing the ids of those regions, or as a JSON structure which also contains additional information such as population counts etc.

The data is sourced from the [whosonfirst](https://github.com/whosonfirst-data/whosonfirst-data) project, this project also includes different language translations of place names.

Placeholder supports searching on and retrieving tokens in different languages and also offers support for synonyms and abbreviations.

The engine includes a rudimentary language detection algorithm which attempts to detect right-to-left languages and languages which write their addresses in major-to-minor format. It will then reverse the tokens to re-order them in to minor-to-major ordering.

---

## requirements

Placeholder requires Node.js and SQLite

See [Pelias software requirements](https://github.com/pelias/documentation/blob/master/requirements.md) for required and recommended versions.

## install

```bash
$ git clone git@github.com:pelias/placeholder.git && cd placeholder
$ npm install
```

### download the required database files

```bash
$ mkdir data
$ curl -s https://s3.amazonaws.com/pelias-data.nextzen.org/placeholder/store.sqlite3.gz | gunzip > data/store.sqlite3;
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

took: 3ms
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

The `/parser/findbyid` endpoint also accepts a `?lang=xxx` property which will return the selected lang if the translation exists and all translations otherwise.

for example, the following url will return strings in French / Korean where available:

```javascript
/parser/findbyid?ids=85633147,102191581,85862899&lang=fra
/parser/findbyid?ids=85633147,102191581,85862899&lang=kor
```

the demo is also able to serve responses in different languages by providing the language code in the URL anchor:

```bash
/demo#jpn
/demo#chi
/demo#eng
/demo#fra
... etc.
```

### filtering by placetype

the `/parser/search` endpoint accepts a `?placetype=xxx` parameter which can be used to control the placetype of records which are returned.

the API does not provide any performance benefits, it is simply a convenience API to filter by a whitelist.

you may specify multiple placetypes using a comma to separate them, such as `?placetype=xxx,yyy`, these are matched as OR conditions. eg: (xxx OR yyy)

for example:

the query `search?text=luxemburg` will return results for the `country`, `region`, `locality` etc.

you can use the placetype filter to control which records are returned:

```
# all matching results
search?text=luxemburg

# only return matching country records
search?text=luxemburg&placetype=country

# return matching country or region records
search?text=luxemburg&placetype=country,region
```

### live mode (BETA)

the `/parser/search` endpoint accepts a `?mode=live` parameter pair which can be used to enable an autocomplete-style API.

in this mode the final token of each input text is considered as 'incomplete', meaning that the user has potentially only typed part of a token.

this mode is currently in BETA, the interface and behaviour may change over time.

### configuring the rtree threshold

the default matching strategy uses the `lineage` table to ensure that token pairs represent a valid child->parent relationship. this ensures that queries like 'London France' do not match, because there is no entry in the lineage table linking those two places together.

in some cases it's preferable to fall back to a matching strategy which considers geographically nearby places with a matching name, even if that relationship does not explicitly exist in the lineage table.

for example, 'Basel France' will return 'Basel Switzerland'. this is useful for handling user input errors and errors and omissions from the lineage table.

in the example above, 'Basel France' only matches because the bounding box of 'Basel' overlaps the bounding box of 'France' and no other valid entry for 'Basel France' exists.

the definition of what is 'nearby' is configurable, the bbox for the minor term (left token) is expanded by a threshold (the threshold is added or subtracted to each of the bbox vertices).

by default the threshold is set as `0.2` (degrees), any float value between 0 and 1 may be specified via the enviornment variable `RTREE_THRESHOLD`.

a setting of less than 0 will disable the rtree functionality completely. disabling the rtree will result in nearby queries such as 'Basel France' returning 'France' instead of 'Basel Switzerland'.

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
the database is created from geographic data sourced from the [whosonfirst](https://whosonfirst.org/) project.

the whosonfirst project is distributed as geojson files, so in order to speed up development we first extract the relevant data in to a file: `data/wof.extract`.

the following command will iterate over all the `geojson` files under the `WOF_DIR` path, extracting the relevant properties in to the file `data/wof.extract`.

this process can take 30-60 minutes to run and consumes ~350MB of disk space, you will only need to run this command once, or when your local `whosonfirst-data` files are updated.

```bash
$ WOF_DIR=/data/whosonfirst-data/data npm run extract
```

alternatively you can download the extract file from our s3 bucket:

```bash
$ mkdir data
$ curl -s https://s3.amazonaws.com/pelias-data.nextzen.org/placeholder/wof.extract.gz | gunzip > data/wof.extract;
```

now you can rebuild the `data/store.json` file with the following command:

this should take 2-3 minutes to run:

```bash
$ npm run build
```

---

## Using the Docker image

### rebuild the image

you can rebuild the image on any system with the following command:

```bash
$ docker build -t pelias/placeholder .
```

### download pre-built image

Up to date Docker images are built and automatically pushed to Docker Hub from our continuous integration pipeline

You can pull the latest stable image with

```bash
$ docker pull pelias/placeholder
```

### download custom image tags

We publish each commit and the latest of each branch to separate tags

A list of all available tags to download can be found at https://hub.docker.com/r/pelias/placeholder/tags/

---

### uploading a new build to s3

this section is applicable to mapzen employees only and requires s3 credentials and the `aws` command to be installed and configured prior to running.

other organizations may elect to change the bucket name in the config and utilize the same script.

the script takes care of creating a date stamped archive and promoting the most recent build to the root of the bucket (with a public ACL).

```bash
$ AWS_PROFILE=nextzen ./cmd/s3_upload.sh

--- gzipping data files ---
--- uploading archive ---
upload: data/store.sqlite3.gz to s3://pelias-data.nextzen.org/placeholder/archive/2017-09-29/store.sqlite3.gz
upload: data/wof.extract.gz to s3://pelias-data.nextzen.org/placeholder/archive/2017-09-29/wof.extract.gz
--- list remote archive ---
2017-09-29 14:52:33   46.6 MiB store.sqlite3.gz
2017-09-29 14:53:08   53.8 MiB wof.extract.gz

> would you like to promote this build to production (yes/no)?
no
you did not answer yes, the build was not promoted to production
```
