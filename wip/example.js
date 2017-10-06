
// var async = require('async');
// var memdown = require('memdown');
var Database = require('./Database');
var State = require('./State');
var encoding = require('./encoding');
var db = new Database('./db' );

// db.intersectSubject( 'wellington', 'new zealand', (err2, res2) => {
//   debug( 'wellington', err2, res2 );
// });

db.matchSubjectObject( 'wellington', 'new zealand', (err2, res2) => {
  debug( 'wellington', err2, res2 );
});

function debug( head, err, res ){
  console.error( head );
  console.error( 'err:', err );
  console.error( 'res:', res );
  // console.error( 'res:', JSON.stringify( res.map( function( re ){
  //   return re.map( function( r ){
  //     return r.toString('utf8');
  //   })
  // }), null, 2 ));
}
