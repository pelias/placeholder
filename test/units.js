var tape = require('tape');
var path = require('path');

var tests = [
  './lib/jsonParseStream',
  './lib/analysis',
  './lib/permutations',
  './lib/sorted',
  './lib/Database',
  './lib/DocStore',
  './lib/TokenIndex',
  './lib/Queries',
  './lib/Result',
  './prototype/wof',
  './prototype/io',
  './prototype/tokenize',
  './prototype/query',
];

// test runner
tests.map( function( testpath ){

  var file = require( testpath );

  var test = function( name, func ) {
    return tape( path.normalize( testpath ) + ': ' + name , func );
  };

  for( var testCase in file ){
    if( 'function' === typeof file[testCase] ){
      file[testCase]( test );
    }
  }
});
