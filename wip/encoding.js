'use strict';

let util = require('util');
let State = require('./State');

const byte = {
  empty:  null,
  low:    '\x00',
  high:   '\xFF',
  bound: {
    subject:  '',
    object:   '\x02',
    id:       '\x03'
  },
};

const fmt = {
  state:  [ byte.bound.subject, byte.bound.object, byte.bound.id ].join('%s')
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
    let prefix = Buffer.from( util.format( fmt.state, state.subject, state.object ) );
    return Buffer.concat([ prefix, codec.id.encode( state.id ) ]);
  },
  decode: ( str ) => {

    let buffer = '';
    let subject = '', object = '', idBytes = '';
    let step = 0;

    str.toString('utf8').split('').forEach((char, i) => {
      switch( step ){
        case 0:
          if( char === byte.bound.object ){ step = 1; return; }
          subject += char;
          return;
        case 1:
          if( char === byte.bound.id ){ step = 2; return; }
          object += char;
          return;
        case 2:
          idBytes += char;
      }
    });

    return new State( subject, object, codec.id.decode( idBytes ) );
  }
};

module.exports.byte = byte;
module.exports.fmt = fmt;
module.exports.codec = codec;
