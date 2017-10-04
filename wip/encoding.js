'use strict';

let util = require('util');
let State = require('./State');

const byte = {
  empty:  null,
  low:    '\x00',
  high:   '\xFF',
  bound: {
    from: '',
    to:   '\x02',
    id:   '\x03'
  },
};

const fmt = {
  state:  [ byte.bound.from, byte.bound.to, byte.bound.id ].join('%s')
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
          if( char === byte.bound.to ){ step = 1; return; }
          from += char;
          return;
        case 1:
          if( char === byte.bound.id ){ step = 2; return; }
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
