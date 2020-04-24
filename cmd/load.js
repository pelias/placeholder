const split = require('split2');
const through = require('through2');
const parser = require('../lib/jsonParseStream');
const Placeholder = require('../Placeholder');
const ph = new Placeholder();

// run import pipeline
console.error('import...');
ph.load({ reset: true });

// run import
process.stdin.pipe( split() )
             .pipe( parser() )
             .pipe( through.obj( function insert( row, _, next ){
               ph.insertWofRecord( row, next );
             }, function flush( done ){
               console.error('populate fts...');
               ph.populate();
               console.error('optimize...');
               ph.optimize();
               console.error('close...');
               ph.close();
               done();
             }));
