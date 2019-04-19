#!/usr/bin/env node
const path = require('path');
const whosonfirst = require('pelias-whosonfirst');
const SQLiteStream = whosonfirst.SQLiteStream;
const through = require('through2');
const Placeholder = require('../Placeholder');

const WOF_DIR = process.env.WOF_DIR || '/data/whosonfirst-data/data';
const layers = [
  'ocean',
  'continent',
  'marinearea',
  'empire',
  'country',
  'dependency',
  'disputed',
  'macroregion',
  'region',
  'macrocounty',
  'county',
  'localadmin',
  'locality',
  'borough',
  'macrohood',
  'neighbourhood'
];
const ph = new Placeholder();
ph.load({ reset: true });

new SQLiteStream(
  path.join(WOF_DIR, 'sqlite', 'whosonfirst-data-latest.db'),
  SQLiteStream.findGeoJSONByPlacetype(layers)
)
  .pipe(whosonfirst.toJSONStream())
  .pipe(through.obj((row, _, next) => {
    ph.insertWofRecord(row.properties, next);
  }, done => {
    console.error('populate fts...');
    ph.populate();
    console.error('optimize...');
    ph.optimize();
    console.error('close...');
    ph.close();
    done();
  }));
