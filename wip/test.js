
var util = require('util');
var DocStore = require('../lib/DocStore');
var Database = require('./Database');

var db = new Database('./db' );
var store = new DocStore('./db' );
store.open('./data/store.sqlite3');

var tokenize = require('./test_tokenize').tokenize.bind({
  graph: {
    hasToken: db.hasSubject.bind( db ),
    hasTokenAutocomplete: db.hasSubjectAutocomplete.bind( db )
  }
});

var debug = false;

// var text = 'Example Street Neutral Bay North Sydney New South Wales 9999 AU';
// var text = '123 apple bay ave neutral bay north sydney rome new south wales au';
// var text = 'paris fr';
var text = ( process.argv.length > 2 ) ? process.argv.slice(2).join(' ') : 'test string';

var query = require('./query').query;

query( db, tokenize, text, ( err, windows, mask, group ) => {
  console.log( '===================================================' );
  console.timeEnd('total');
  if( err ){ console.error( err ); }
  if( debug ){ console.error( 'results', windows ); }
  console.error( 'group', group );
  console.error( 'mask', mask );
  console.log( '===================================================' );
  store.getMany( windows, function( err, docs ){
    if( err ){ return console.error( err ); }
    docs.forEach( function( doc ){
      console.log( ' -', [ doc.id, doc.placetype + ' ', doc.name ].join('\t') );
    });
    console.log( '===================================================' );
  });
});
