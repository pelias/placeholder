
var async = require('async');
var InvertedIndex = require('./InvertedIndex');
var idx = new InvertedIndex('./db');

var State = function( from, to, id ){
  this.from = from;
  this.to = to;
  this.id = id;
};

var states = [
  new State('foo', 'bar', 1),
  new State('foo', 'baz', 1),
  new State('boo', 'foo', 2),
  new State('boo', 'baz', 2),
];

// write states to db
function writer( states, done ){
  async.series( states.map( state => {
    return cb => idx.putState( state, cb );
  }), done );
}

// read states from db
function reader( states, done ){
  async.series( states.map( state => {
    return cb => idx.getState( state, cb );
  }), done );
}

// read next states for prefix
function next( states, done ){
  async.series( states.map( state => {
    return cb => idx.readNext( state, cb );
  }), done );
}

// load states in to db
writer( states, (err, res) => {
  // debug( 'write', err, res );

  // read states from db
  reader( states, (err, res) => {
    // debug( 'read', err, res );
  });

  // read next states for prefix
  next( states, (err, res) => {
    debug( 'next', err, res );
  });
});

function debug( head, err, res ){
  console.error( head );
  console.error( 'err:', err );
  console.error( 'res:', res );
}
