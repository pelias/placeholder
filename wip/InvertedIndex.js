
var util = require('util');
var levelup = require('levelup');

// const TOKEN_PREFIX = '*';
const BYTE_DELIM = '\x02';
const BYTE_EMPTY = null;
const BYTE_START = '\x00';
const BYTE_END = '\xFF';

const FMT_TOKEN = '\x01%s';
const FMT_STATE = '%s\x02%s\x03';

// function memberKey( key, int ){
//   return [ key, BYTE_DELIM, int ].join();
// }

function InvertedIndex( path ){
  this.db = levelup( path );
}
//
// InvertedIndex.prototype.getToken = function( token, cb ){
//   this.db.get( TOKEN_PREFIX + token, cb );
// };
//
// InvertedIndex.prototype.hasToken = function( token, cb ){
//   this.getToken( TOKEN_PREFIX + token, function( err ){
//     cb( err && err.notFound );
//   });
// };
//
// InvertedIndex.prototype.addToken = function( id, token, cb ){
//   this.db.set( memberKey( TOKEN_PREFIX + token, id ), BYTE_EMPTY, cb );
// };

InvertedIndex.prototype.putState = function( state, cb ){
  var prefix = Buffer.from( util.format( FMT_STATE, state.from, state.to ) );
  var id = Buffer.alloc( byteLength( state.id ) );
  id.writeUInt32LE( state.id, 0 );

  var key = Buffer.concat([ prefix, id ]);
  this.db.put( key, BYTE_EMPTY, cb );
};

InvertedIndex.prototype.getState = function( state, cb ){
  var prefix = Buffer.from( util.format( FMT_STATE, state.from, state.to ) );
  var id = Buffer.alloc( byteLength( state.id ) );
  id.writeUInt32LE( state.id, 0 );

  var key = Buffer.concat([ prefix, id ]);
  this.db.get( key, cb );
};

InvertedIndex.prototype.readNext = function( state, cb ){
  var res = [];
  this.db.createKeyStream({ gt: state.from + BYTE_DELIM, lt: state.from + BYTE_END + BYTE_DELIM })
         .on('data',  (data)  => res.push( data ))
         .on('error', (err)   => cb( err ))
         .on('end',   ()      => cb( null, res ));
};

function byteLength( x ){
  return Math.ceil(( x / Math.log10(2) ) /8 ) +1;
}

module.exports = InvertedIndex;
