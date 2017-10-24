var tape = require('tape');
var path = require('path');

var tests = [
  './lib/analysis',
  './lib/permutations',
  './lib/sorted',
  './lib/TokenGraph',
  './wip/encoding',
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
