
var fs = require('fs'),
    path = require('path'),
    split = require('split'),
    through = require('through2'),
    Placeholder = require('../Placeholder');

var assert = require('assert');

/**
  this test reads the 'generated.txt' file (is present) and uses it's lines
  to generate test cases.

  see: README.md for more info on how to generate 'generated.txt'.
**/

module.exports.generated = function(test, util) {

  // ensure the file is available in the filesystem
  var testcasePath = path.join( __dirname, 'generated.txt' );
  try { fs.statSync( testcasePath ); }
  catch( e ) {
    return console.error('%s not found, skipping test', testcasePath);
  }

  // load placeholder data
  var ph = new Placeholder();
  ph.load();

  // convenience assertion function
  var assert = runner.bind(null, test, ph);

  // stream the test cases, run them one-by-one
  var stream = fs.createReadStream( testcasePath, 'utf8' );
  stream.pipe( split() )
        .pipe( through( function( line, _, next ){
          if( !line.length ){ return; } // skip empty lines
          var split = line.toString('utf8').split(' ');
          var id = parseInt( split[0], 10 );
          assert( split.slice(1).join(' '), id, next );
        }));
};

// convenience function for writing quick 'n easy test cases
function runner( test, ph, actual, expected, next ){
  // tape( actual, function(t) {
  try {
    process.stderr.write('.');
    // console.time('took');
    var resultIds = ph.query( ph.tokenize( actual ) );
    // console.timeEnd('took');
    assert.ok( -1 !== resultIds.indexOf( expected ), 'id found in results' );
  } catch( e ){
    console.log( '\n------------------------' );
    console.log( 'input', actual );
    console.log( 'expected', expected );
    console.log( ph.tokenize( actual ) );
    console.log( resultIds );
    console.log( e );
  }
    // t.end();
    next();
  // });
}
