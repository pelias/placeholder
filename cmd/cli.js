
var Placeholder = require('../Placeholder'),
    ph = new Placeholder();

// init placeholder
ph.load();

// -- user input --
var input = ( process.argv.slice(3) || [] ).join(' ');
console.log( input );

// -- search --
console.time('search');
var tokens = ph.tokenize( input );
var results = ph.query( tokens );
console.timeEnd('search');

// print results
results.forEach( function( resultId ){
  var doc = ph.store.get( resultId );
  console.log( ' -', [ resultId, doc.placetype + ' ', doc.name ].join('\t') );
});

// console.log( ph.store.get( 102063273 ) );
// console.log( ph.store.get( 102063261 ) );
// console.log( ph.store.get( 101748479 ) );
// console.log( ph.graph.nodes[ 'north sydney' ] );
// console.log( ph.store.get( 101931469 ) );
// console.log( ph.graph.nodes[ 'mitte berlin' ] );
