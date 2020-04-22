const path = require('path');
const fs = require('fs');
const whosonfirst = require('pelias-whosonfirst');
const SQLiteStream = whosonfirst.SQLiteStream;
const through = require('through2');
const Placeholder = require('../Placeholder');

const WOF_DIR = process.env.WOF_DIR || '/data/whosonfirst-data/sqlite';

const layers = fs.readFileSync(path.join(__dirname, 'placetype.filter'), 'utf-8')
                  .replace(/^.*\(/, '') // Removes all characters before the first parenthesis
                  .match(/[a-z]+/g); // Get the layer list

const jq_filter = fs.readFileSync(path.join(__dirname, 'jq.filter'), 'utf-8')
                    .match(/test\("(.*)"\)/g) // Get all tests
                    .map(s => s.replace(/^[^"]+"/, '').replace(/"[^"]+$/, '')) // Get only regex part
                    .map(s => new RegExp(s)); // Transform it into JS RegExp

const output = () => {
  if (process.argv.length > 2 && process.argv[2] === 'build') {
    const ph = new Placeholder();
    ph.load({ reset: true });
    return through.obj((row, _, next) => {
      ph.insertWofRecord(row, next);
    }, done => {
      console.error('populate fts...');
      ph.populate();
      console.error('optimize...');
      ph.optimize();
      console.error('close...');
      ph.close();
      done();
    });
  } else {
    return through.obj((row, _, next) => {
      console.log(JSON.stringify(row));
      next();
    });
  }
};

new SQLiteStream(
  path.join(WOF_DIR, 'whosonfirst-data-latest.db'),
  SQLiteStream.findGeoJSONByPlacetype(layers)
)
  .pipe(whosonfirst.toJSONStream())
  .pipe(through.obj((row, _, next) => {
    Object.keys(row.properties)
          .filter(key => !jq_filter.some(regex => regex.test(key)))
          .forEach(key => delete row.properties[key]);
    next(null, row.properties);
  }))
  .pipe(output());
