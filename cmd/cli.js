
var Placeholder = require('../Placeholder'),
    ph = new Placeholder();

// init placeholder
ph.load();

// -- user input --
var input = ( process.argv.slice(2) || [] ).join(' ') || '';
console.log( input + '\n' );

// -- search --
console.time('took');
ph.query( input, ( err, ids, mask, group ) => {
  console.timeEnd('took');

  // print results
  ph.store.getMany( ids, (err, docs) => {
    docs.forEach( doc => {
      console.log( ' -', [ doc.id, doc.placetype + ' ', doc.name ].join('\t') );
    });
  });
});
