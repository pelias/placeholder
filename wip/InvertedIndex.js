
var levelup = require('levelup');
var intersect = require('sorted-intersect-stream');
var encoding = require('./encoding');

function InvertedIndex( path ){
  this.db = levelup( path );
}

InvertedIndex.prototype.putState = function( state, cb ){
  this.db.put( encoding.codec.state.encode( state ), encoding.byte.empty, cb );
};

InvertedIndex.prototype.getState = function( state, cb ){
  this.db.get( encoding.codec.state.encode( state ), cb );
};

InvertedIndex.prototype.prefixMatch = function( from, cb ){
  this._keyStreamToStateArray( this.db.createKeyStream({
    gt: from + encoding.byte.delim,
    lt: from + encoding.byte.end + encoding.byte.delim
  }), cb );
};

InvertedIndex.prototype.prefixIntersect = function( fromA, fromB, cb ){
  this._keyStreamToStateArray( intersect(
    this.db.createKeyStream({
      gt: fromA + encoding.byte.delim,
      lt: fromA + encoding.byte.end + encoding.byte.delim
    }),
    this.db.createKeyStream({
      gt: fromB + encoding.byte.delim,
      lt: fromB + encoding.byte.end + encoding.byte.delim
    }),
    // only compare id bytes (very fast)
    ( key ) => { return key.slice( key.lastIndexOf('\x03') ); }),
    cb
  );
};

InvertedIndex.prototype._keyStreamToStateArray = function( stream, cb ){
  var res = [];
  stream.on('data',  (data)  => res.push( encoding.codec.state.decode(data) ))
        .on('error', (err)   => cb( err ))
        .on('end',   ()      => cb( null, res ));
};

module.exports = InvertedIndex;
