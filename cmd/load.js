
var split = require('split2'),
    through = require('through2'),
    parse = require('../lib/parse'),
    Placeholder = require('../Placeholder'),
    ph = new Placeholder();

// run import pipeline
console.error('import...');
ph.load({ reset: true });

// run import
process.stdin.pipe( split() )
             .pipe( parse() )
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
