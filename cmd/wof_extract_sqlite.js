const path = require('path');
const fs = require('fs');
const whosonfirst = require('pelias-whosonfirst');
const config = require('pelias-config').generate().imports.whosonfirst;
const SQLiteStream = whosonfirst.SQLiteStream;
const through = require('through2');
const Placeholder = require('../Placeholder');
const combinedStream = require('combined-stream');

const SQLITE_REGEX = /whosonfirst-data-[a-z0-9-]+\.db$/;

// Use WOF_DIR env variable when available, otherwise use the location specified in pelias.json
const WOF_DIR = process.env.WOF_DIR ? [process.env.WOF_DIR] : [path.join(config.datapath), path.join(config.datapath, 'sqlite')];

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

const sqliteStream = combinedStream.create();
WOF_DIR.forEach(dir => {
  fs.readdirSync(dir)
    .filter(file => SQLITE_REGEX.test(file))
    .map(file => {
      if (fs.existsSync(path.join(config.datapath, 'sqlite', file))) {
        return path.join(config.datapath, 'sqlite', file);
      }
      else {
        return path.join(config.datapath, file);
      }
    })
    .forEach(dbPath => {
      sqliteStream.append(next => {
        next(new SQLiteStream(
          dbPath,
          config.importPlace ?
            SQLiteStream.findGeoJSONByPlacetypeAndWOFId(layers, config.importPlace) :
            SQLiteStream.findGeoJSONByPlacetype(layers)
        ));
      });
    })
});

sqliteStream
  .pipe(whosonfirst.toJSONStream())
  .pipe(through.obj((row, _, next) => {
    Object.keys(row.properties)
          .filter(key => !jq_filter.some(regex => regex.test(key)))
          .forEach(key => delete row.properties[key]);
    next(null, row.properties);
  }))
  .pipe(output());
