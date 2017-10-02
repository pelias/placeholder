
// var async = require('async');
// var memdown = require('memdown');
var InvertedIndex = require('./InvertedIndex');
var State = require('./State');
var encoding = require('./encoding');
var idx = new InvertedIndex('./db' );

var states = [
  new State('shoreditch', 'hackney', 1),
  new State('hackney', 'london', 1),
  new State('shoreditch', 'london', 1),
  new State('islington', 'london', 2),
  new State('angel', 'islington', 2),
  new State('angel', 'london', 2),
  new State('paris', 'texas', 3),
  new State('paris', 'france', 3),
  new State('pizza', 'france', 3),
  new State('paris', '', 40),
  new State('pizza', '', 40),
];

// write states to db
// function writer( states, done ){
//   async.series( states.map( state => {
//     return cb => idx.putState( state, cb );
//   }), done );
// }

// // read states from db
// function reader( states, done ){
//   async.series( states.map( state => {
//     return cb => idx.getStateValue( state, cb );
//   }), done );
// }

// read next states for prefix
// function next( states, done ){
//   async.series( states.map( state => {
//     return cb => idx.prefixMatch( state.from, cb );
//   }), done );
// }

// var async = require('async');

// load states in to db
idx.putStateMany( states, (err, res) => {
  // debug( 'write', err, res );

  // read states from db
  // reader( states, (err, res) => {
  //   // debug( 'read', err, res );
  // });

  // read next states for prefix
  // next( states, (err, res) => {
  //   debug( 'next', err, res );
  // });

  idx.prefixIntersect( 'paris', 'pizza', (err2, res2) => {
    debug( 'paris', err2, res2 );


    // idx.dump()
  });
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
