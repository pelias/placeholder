
var split = require('split2'),
    through = require('through2'),
    parse = require('../lib/parse'),
    Placeholder = require('../Placeholder'),
    ph = new Placeholder();

// run import pipeline
process.stdin.pipe( split() )
             .pipe( parse() )
             .pipe( through.obj( function insert( row, _, next ){
               ph.insertWofRecord( row );
               next();
             }, function flush( next ){
               console.error('importing...');
               ph.printStatistics();
               console.error('sorting...');
               ph.graph.sort(); // sort all arrays
               console.error('saving...');
               ph.save();
               next();
             }));
