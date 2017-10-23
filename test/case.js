
var fs = require('fs'),
    path = require('path'),
    assert = require('assert'),
    split = require('split2'),
    through = require('through2'),
    Placeholder = require('../Placeholder');

/**
  this test reads the 'test/cases/*.txt' files (if present) and uses it's lines
  to generate test cases.

  see: README.md for more info on how to generate test cases.
**/

// ensure the file is available in the filesystem
var testcasePath = process.argv[2];
try { fs.statSync( testcasePath ); }
catch( e ) {
  return console.error('%s not found, skipping test', testcasePath);
}

console.error( '----------- ' + testcasePath + ' -----------' );

// --------------

// load placeholder data
var ph = new Placeholder();
ph.load();

// stream the test cases, run them one-by-one
var stream = fs.createReadStream( testcasePath, 'utf8' );
stream.pipe( split() )
      .pipe( through( function( line, _, next ){
        if( !line.length ){ return; } // skip empty lines
        var split = line.toString('utf8').split(' ');
        var id = parseInt( split[0], 10 );
        runner( ph, split.slice(1).join(' '), id, next );
      }, function( done ){
        console.log();
        done();
      }));

// --------------

// convenience function for writing quick 'n easy test cases
function runner( ph, actual, expected, next ){
  ph.wip.query( actual, ( err, ids, mask, group ) => {

    process.stderr.write('.');

    try {
      assert.ok( -1 !== ids.indexOf( expected ), 'id found in results' );
    }

    catch( e ){
      console.log('\n');
      console.log('input:    ', actual);
      console.log('expected: ', expected);
      console.log('actual:   ', ids.join(', '));
      console.log();
    }

    finally {
      next();
    }

  });
}
