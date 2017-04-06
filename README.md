
natural language parser for geographic text

---

## required data files

you will need to download a `fts.sqlite3` database file for use with this container. This sqlite3 database file contains the dictionary terms and administrative ids required to run the parser.

### download

download a copy of the database file and extract it in one command:

```bash
$ curl -s http://missinglink.geo.s3.amazonaws.com/fts.sqlite3.gz | gzip -d > fts.sqlite3
```

---

## run server

you'll need to give the container access to the database file and select a port for the server to listen on.

in the command below the `-p` port mapping command and the `-v` volume mapping commands have two parts seperated by a `:`. In both cases the first part refers to the configuration for your local machine and the second part refers to the container internal configuration.

you must change the `/download_directory` below to point to the location of the directory where you downloaded the database file.

you may optionally change the port mapping so that it listens on a port other than `5000`.

```bash
$ docker run -p 5000:3000 -v /download_directory:/database -d mapzen/pelias-placeholder
```

### open browser

the server should now be running and you should be able to access the http API:

```bash
http://localhost:5000/demo
```

---

## debugging

if you are unable to access the service from your browser you'll need to debug what's causing the error.

### logs

each container has a unique id which you can find with `docker ps -a`, using that id you can get logs for running and exited containers:

```bash
$ docker logs 12835fa9e1749f209e999414a914e167b0d511eb87503118ed8bb357c5c6b721

server listening on port 3000
```

### interactive shell

if you're still stuck you can run a bash shell inside the container and check that the configuration is correct:

```bash
$ docker run --rm -it mapzen/pelias-placeholder bash
```

---

## tests

there is a convenience script which is useful for rebuilding the image and running tests, it requires that the `fts.sqlite` database is accessible in a directory named `db` in the root of this project.

### run the test suite

```
$ ./dev/rebuild.sh
```

---

## contributing

the service is built using the `fts5` extension for sqlite3, this extension is a more modern version of the `fts3` and `fts4` extensions commonly available via package managers such as `apt`.

we recommend you use the docker image https://hub.docker.com/r/missinglink/gis/ as the base for your development, this image contains the latest versions of `sqlite3` as well as `spatialite` and other gis software packages.

if you are running on ubunutu you may use the scripts I used to generate that image to install the software directly on your system, some minor tweaks may need to be made depending on your exact version of ubuntu.

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

## building the database

the database is created from geographic data sourced from the [whosonfirst](https://whosonfirst.mapzen.com/) project.

the whosonfirst project is distributed as geojson files, so in order to speed up development we use an interim database which already has whosonfirst imported in to sqlite3.

the code to create the `wof.sqlite3` database can be found here: https://github.com/missinglink/wof-spatialite.

or you can download a prebuild image from http://missinglink.geo.s3.amazonaws.com/wof.sqlite3.gz, note that this file may become out-of-date over time.

### regenerating the fts.sqlite database

you must change the `/database_directory` below to point to the location of the directory where you downloaded the source `wof.sqlite3` database file.

it can take 4-5 mins to generate the database, so grab a coffee and have a listen to this podcast https://changelog.com/podcast/201 while you wait.

```bash
$ docker run --rm -it -v /database_directory:/database -e 'DB=/database/fts.sqlite3' -e 'SOURCE=/database/wof.sqlite3' mapzen/pelias-placeholder script/rebuild.sh
```

you can now find your shiny new `fts.sqlite3` database in your `/database_directory` directory.
