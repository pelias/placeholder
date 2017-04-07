
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
  ph.store.get( resultId, function( err, doc ){
    console.log( ' -', [ resultId, doc.placetype + ' ', doc.name ].join('\t') );
  });
});
