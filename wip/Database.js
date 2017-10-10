
var levelup = require('level');
var async = require('async');
var intersect = require('sorted-intersect-stream');
var encoding = require('./encoding');

var globalOpts = {
  keyEncoding: 'binary',
  valueEncoding: 'binary'
};

function Database( path, options ){
  options = options || {};
  options.keyAsBuffer = true;
  this.db = levelup( path, options );
}

// save $state to the database
Database.prototype.putState = function( state, cb ){
  this.db.put( encoding.codec.state.encode( state ).toString('hex'), state.value, globalOpts, cb );
};

// save many values as per function above
Database.prototype.putStateMany = function( states, cb ){
  async.series( states.map( state => {
    return done => this.putState( state, done );
  }), cb );
};

// retrieve the value associated by the key represented by $state
Database.prototype.getStateValue = function( state, cb ){
  this.db.get( encoding.codec.state.encode( state ).toString('hex'), globalOpts, cb );
};

// retrieve many values as per function above
Database.prototype.getStateValueMany = function( states, cb ){
  async.series( states.map( state => {
    return done => this.getStateValue( state, done );
  }), cb );
};

// cb( bool ) whether an arbitrary byte prefix exist in the db
Database.prototype._hasPrefix = function( prefix, cb ){
  var found = false;
  this.db.createKeyStream({
    gte: prefix,
    lte: Buffer.concat([ prefix, Buffer.from( encoding.byte.high ) ]),
    keyAsBuffer: true,
    keyEncoding: 'binary',
    valueEncoding: 'binary',
    limit: 1
  }).on('data',  (data)  => { found = true; })
    .on('error', (err)   => cb( false ))
    .on('end',   ()      => cb( found ));
};

// cb( bool ) whether a 'subject' value exists in the db
Database.prototype.hasSubject = function( subject, cb ){
  this._hasPrefix( Buffer.concat([
    Buffer.from( subject ),
    Buffer.from( encoding.byte.bound.object )
  ]), cb );
};

// cb( bool ) whether a 'subject' and 'object' pair of values exists in the db
Database.prototype.hasSubjectObject = function( subject, object, cb ){
  this._hasPrefix( Buffer.concat([
    Buffer.from( subject ),
    Buffer.from( encoding.byte.bound.object ),
    Buffer.from( object ),
    Buffer.from( encoding.byte.bound.id )
  ]), cb );
};

function incrementBuffer( buf ){
  var nextBuf = Buffer.alloc( buf.length );
  buf.copy( nextBuf, 0 );
  nextBuf[ buf.length-1 ] = nextBuf[ buf.length-1 ] +1;
  return nextBuf;
}

// cb( err, res ) all entries which have the specified prefix
Database.prototype._prefixMatch = function( prefix, cb ){
  this._keyStreamToStateArray( this.db.createKeyStream({
    gte: prefix,
    lt: incrementBuffer( prefix ),
    keyAsBuffer: true,
    keyEncoding: 'binary',
    valueEncoding: 'binary',
    limit: -1
  }), cb );
};

// cb( err, res ) all entries which have the specified 'subject' value
Database.prototype.matchSubject = function( subject, cb ){
  this._prefixMatch( Buffer.concat([
    Buffer.from( subject ),
    Buffer.from( encoding.byte.bound.object )
  ]), cb );
};

// cb( err, res ) all entries which have both the specified 'subject' and 'object' values
Database.prototype.matchSubjectObject = function( subject, object, cb ){
  this._prefixMatch( Buffer.concat([
    Buffer.from( subject ),
    Buffer.from( encoding.byte.bound.object ),
    Buffer.from( object ),
    Buffer.from( encoding.byte.bound.id )
  ]), cb );
};

// cb( err, res ) all entries which share an ID from the two input prefixes
Database.prototype._prefixIntersect = function( prefixA, prefixB, cb ){
  this._keyStreamToStateArray( intersect(
    this.db.createKeyStream({
      gte: prefixA,
      lte: prefixA + encoding.byte.high,
      keyAsBuffer: true,
      keyEncoding: 'binary',
      valueEncoding: 'binary',
      limit: -1
    }),
    this.db.createKeyStream({
      gte: prefixB,
      lte: prefixB + encoding.byte.high,
      keyAsBuffer: true,
      keyEncoding: 'binary',
      valueEncoding: 'binary',
      limit: -1
    }),
    // only compare id bytes (very fast)
    ( key ) => {
      // @todo: this matched BOTH subjectId and objectID
      return key.slice( key.indexOf( encoding.byte.bound.id ) );
    }),
    cb
  );
};

// cb( err, res ) all entries which share an ID with the two input 'subject' values
Database.prototype.intersectSubject = function( subjectA, subjectB, cb ){
  this._prefixIntersect(
    subjectA + encoding.byte.bound.object,
    subjectB + encoding.byte.bound.object,
    cb
  );
};

// helper function to handle key streams, decoding them and converting them to an array
Database.prototype._keyStreamToStateArray = function( stream, cb ){
  var res = [];
  stream.on('data',  (data)  => { res.push( encoding.codec.state.decode( data )); })
        .on('error', (err)   => cb( err ))
        .on('end',   ()      => cb( null, res ));
};

// helper function to dump the whole database to the console
Database.prototype.dump = function(){
  this.db.createReadStream().on('data', console.log);
};

module.exports = Database;
