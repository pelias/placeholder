
natural language parser for geographic text

---

## install

the data files are stored in this repository using [Git FLS](https://git-lfs.github.com/), please ensure that `LFS` is installed before continuing.

```bash
$ git clone git@github.com:pelias/placeholder.git && cd placeholder
$ npm install
```

---

## run server

```bash
$ PORT=6100 npm start;
```

### open browser

the server should now be running and you should be able to access the http API:

```bash
http://localhost:6100/demo
```

try the following paths:

```javascript
/demo
/parser/findbyid?ids=101748479
/parser/search?text=london
/parser/tokenize?text=sydney new south wales
```

### run the interactive shell

```bash
$ npm run repl

> pelias-placeholder@1.0.0 repl
> node cmd/repl.js

placeholder >
```

try the following commands:

```javascript
placeholder > search('london on')
 - 101735809	locality 	London

placeholder > tokenize('sydney new south wales')
 [ [ 'sydney', 'new south wales' ] ]

placeholder > token('kelburn')
 [ 85772991 ]

placeholder > id(85772991)
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

### run the test suite

```bash
$ npm test
```

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

the whosonfirst project is distributed as geojson files, so in order to speed up development we use an interim database which already has whosonfirst imported in to sqlite3.

the code to create the `wof.sqlite3` database can be found here: https://github.com/missinglink/wof-spatialite.

or you can download a prebuild image from http://missinglink.geo.s3.amazonaws.com/wof.sqlite3.gz, note that this file may become out-of-date over time.

### regenerating the data files

Move the database to `/data/wof.sqlite3` or edit `package.json` with your preferred location.

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
