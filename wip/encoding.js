'use strict';

let util = require('util');
let State = require('./State');

// const TOKEN_PREFIX = '*';
const BYTE_DELIM = '\x02';
const BYTE_EMPTY = null;
const BYTE_START = '\x00';
const BYTE_END = '\xFF';

const FMT_TOKEN = '\x01%s';
const FMT_STATE = '%s\x02%s\x03';

const byte = {
  delim: BYTE_DELIM,
  empty: BYTE_EMPTY,
  start: BYTE_START,
  end: BYTE_END,
};

const fmt = {
  token: FMT_TOKEN,
  state: FMT_STATE,
};

const codec = {};

// id
codec.id = {
  encode: ( num ) => {
    let id = Buffer.alloc( 4 );
    id.writeUInt32LE( num, 0 );
    return id;
  },
  decode: ( str ) => {
    return Buffer.from( str ).readUInt32LE(0);
  }
};

// state
codec.state = {
  encode: ( state ) => {
    let prefix = Buffer.from( util.format( fmt.state, state.from, state.to ) );
    return Buffer.concat([ prefix, codec.id.encode( state.id ) ]);
  },
  decode: ( str ) => {

    let buffer = '';
    let from = '', to = '', idBytes = '';
    let step = 0;
    
    str.toString('utf8').split('').forEach((char, i) => {
      switch( step ){
        case 0:
          if( char === '\x02' ){ step = 1; return; }
          from += char;
          return;
        case 1:
          if( char === '\x03' ){ step = 2; return; }
          to += char;
          return;
        case 2:
          idBytes += char;
      }
    });

    return new State( from, to, codec.id.decode( idBytes ) );
  }
};

module.exports.byte = byte;
module.exports.fmt = fmt;
module.exports.codec = codec;
