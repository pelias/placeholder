
var util = require('util');

var Placeholder = require('../Placeholder'),
    ph = new Placeholder();

// init placeholder
ph.load();

// input test
var text = ( process.argv.length > 2 ) ? process.argv.slice(2).join(' ') : 'test string';

console.time('took');
ph.wip.query( text, ( err, windows, mask, group ) => {
  console.log( '===================================================' );
  console.timeEnd('took');
  if( err ){ console.error( err ); }
  if( false ){ console.error( 'results', windows ); }
  console.error( 'group', group );
  console.error( 'mask', mask );
  console.log( '===================================================' );
  ph.store.getMany( windows, function( err, docs ){
    if( err ){ return console.error( err ); }
    docs.forEach( function( doc ){
      console.log( ' -', [ doc.id, doc.placetype + ' ', doc.name ].join('\t') );
    });
    console.log( '===================================================' );
  });
});
