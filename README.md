
natural language parser for geographic text

---

## install

```bash
$ git clone git@github.com:pelias/placeholder.git && cd placeholder
$ npm install
```

### download and build the database

note: the `npm run build` step can take 2-3 minutes to run, it only needs to be run once.

```bash
$ mkdir data
$ curl -s http://missinglink.geo.s3.amazonaws.com/ph.wof.extract.gz | gunzip > data/wof.extract
$ npm run build
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

for example, the following url will return strings in Japanese where available:

```javascript
/parser/search?text=germany&lang=jpn
/parser/search?text=germany&lang=chi
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
```

---

## tests

### run the test suite

```bash
$ npm test
```

### generate a ~500,000 line test file

this command requires the `data/wof.extract` file mentioned below in the 'building the database' section.

```bash
$ npm run gentests
```

once complete you can find the generated test cases in `test/generated.txt`.

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

the database is created from geographic data sourced from the [whosonfirst](https://whosonfirst.mapzen.com/) project.

the whosonfirst project is distributed as geojson files, so in order to speed up development we first extract the relevant data in to a file: `data/wof.extract`.

the following command will iterate over all the `geojson` files under the `WOF_DIR` path, extracting the relevant properties in to the file `data/wof.extract`.

this process takes about 7 minutes and consumes ~650MB of disk space, you will only need to run this command once, or when your local `whosonfirst-data` files are updated.

```bash
$ WOF_DIR=/data/whosonfirst-data/data npm run extract
```

now you can rebuild the `data/graph.json` and `data/store.json` files with the following command:

this should take less that 1 minutes to run:

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
