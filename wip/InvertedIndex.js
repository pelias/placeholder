
var levelup = require('level');
var async = require('async');
var intersect = require('sorted-intersect-stream');
var encoding = require('./encoding');

function InvertedIndex( path, options ){
  this.db = levelup( path, options );
}

InvertedIndex.prototype.putState = function( state, cb ){
  this.db.put( encoding.codec.state.encode( state ), state.value, cb );
};

InvertedIndex.prototype.putStateMany = function( states, cb ){
  async.series( states.map( state => {
    return done => this.putState( state, done );
  }), cb );
};

InvertedIndex.prototype.getStateValue = function( state, cb ){
  this.db.get( encoding.codec.state.encode( state ), cb );
};

InvertedIndex.prototype.getStateValueMany = function( states, cb ){
  async.series( states.map( state => {
    return done => this.getStateValue( state, done );
  }), cb );
};

InvertedIndex.prototype.hasPrefix = function( from, cb ){
  var found = false;
  this.db.createKeyStream({
    gte: from + encoding.byte.delim,
    lte: from + encoding.byte.delim + encoding.byte.end,
    keyAsBuffer: true,
    limit: 1
  }).on('data',  (data)  => { found = true; })
    .on('error', (err)   => cb( false ))
    .on('end',   ()      => cb( found ));
};

InvertedIndex.prototype.prefixMatch = function( from, cb ){
  this._keyStreamToStateArray( this.db.createKeyStream({
    gte: from + encoding.byte.delim,
    lte: from + encoding.byte.delim + encoding.byte.end,
    keyAsBuffer: true,
    limit: -1
  }), cb );
};

InvertedIndex.prototype.prefixIntersect = function( fromA, fromB, cb ){
  this._keyStreamToStateArray( intersect(
    this.db.createKeyStream({
      gt:  fromA + encoding.byte.delim,
      lte: fromA + encoding.byte.delim + encoding.byte.end,
      keyAsBuffer: true,
      limit: -1
    }),
    this.db.createKeyStream({
      gt:  fromB + encoding.byte.delim,
      lte: fromB + encoding.byte.delim + encoding.byte.end,
      keyAsBuffer: true,
      limit: -1
    }),
    // only compare id bytes (very fast)
    ( key ) => { return key.slice( key.lastIndexOf('\x03') ); }),
    cb
  );
};

InvertedIndex.prototype._keyStreamToStateArray = function( stream, cb ){
  var res = [];
  stream.on('data',  (data)  => res.push( encoding.codec.state.decode( data )))
        .on('error', (err)   => cb( err ))
        .on('end',   ()      => cb( null, res ));
};

InvertedIndex.prototype.dump = function(){
  this.db.createReadStream().on('data', console.log);
};

module.exports = InvertedIndex;
