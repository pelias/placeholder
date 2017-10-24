
var encoding = require('../../wip/encoding');
var State = require('../../wip/State');

module.exports.interface = function(test, util) {
  test('interface', function(t) {
    t.equal(typeof encoding, 'object');
    t.equal(typeof encoding.byte, 'object');
    t.equal(typeof encoding.fmt, 'object');
    t.equal(typeof encoding.codec, 'object');
    t.end();
  });
};

module.exports.byte = function(test, util) {
  test('byte', function(t) {
    t.deepEqual(encoding.byte.empty, null);
    t.equal(typeof encoding.byte.low, 'string');
    t.equal(typeof encoding.byte.high, 'string');
    t.equal(typeof encoding.byte.bound.subject, 'string');
    t.equal(typeof encoding.byte.bound.object, 'string');
    t.equal(typeof encoding.byte.bound.id, 'string');
    t.end();
  });
};

module.exports.fmt = function(test, util) {
  test('fmt', function(t) {
    t.equal(typeof encoding.fmt.state, 'string');
    t.end();
  });
};

module.exports.codec_id = function(test, util) {
  test('codec - id', function(t) {
    t.true(encoding.codec.hasOwnProperty('id'));
    t.equal(typeof encoding.codec.id.encode, 'function');
    t.equal(typeof encoding.codec.id.decode, 'function');
    t.end();
  });
  test('codec - id - encode', function(t) {
    function encode( id ){ return encoding.codec.id.encode(id).toString('hex'); }

    t.equal( encode( 1 ), '01000000' );
    t.equal( encode( 37846327 ), '377d4102' );
    t.equal( encode( 85633111 ), '57a81a05' );
    t.end();
  });
  test('codec - id - decode', function(t) {
    function decode( buf ){ return encoding.codec.id.decode(Buffer.from(buf, 'hex')); }
    t.deepEqual( decode( '01000000' ), 1 );
    t.deepEqual( decode( '377d4102' ), 37846327 );
    t.deepEqual( decode( '57a81a05' ), 85633111 );
    t.end();
  });
};

module.exports.codec_state = function(test, util) {
  test('codec - state', function(t) {
    t.true(encoding.codec.hasOwnProperty('state'));
    t.equal(typeof encoding.codec.state.encode, 'function');
    t.equal(typeof encoding.codec.state.decode, 'function');
    t.end();
  });
  test('codec - state - encode', function(t) {
    function encode( state ){ return encoding.codec.state.encode( state ).toString('hex'); }
    t.equal(
      encode( new State( 1, 'foo', 2, 'bar' ) ),
      '666f6f02626172030100000002000000'
    );
    t.equal(
      encode( new State( 85633111, 'long word', 37846327, 'next word' ) ),
      '6c6f6e6720776f7264026e65787420776f72640357a81a05377d4102'
    );
    t.end();
  });
  test('codec - state - decode', function(t) {
    function decode( buf ){ return encoding.codec.state.decode(Buffer.from(buf, 'hex')); }
    t.deepEqual(
      decode( '666f6f02626172030100000002000000' ),
      new State( 1, 'foo', 2, 'bar' )
    );
    t.deepEqual(
      decode( '6c6f6e6720776f7264026e65787420776f72640357a81a05377d4102' ),
      new State( 85633111, 'long word', 37846327, 'next word' )
    );
    t.end();
  });
  test('codec - state - enc/dec', function(t) {

    [{
      subjectId: 85774601,
      subject: 'neutral bay',
      objectId: 102048877,
      object: 'north sydney',
      value: null
    }, {
      subjectId: 101931387,
      subject: 'neutral bay',
      objectId: 102048877,
      object: 'north sydney',
      value: null
    }, {
      subjectId: 404225267,
      subject: 'neutral bay',
      objectId: 102048877,
      object: 'north sydney',
      value: null
    }]
    .forEach( state => {
      var encoded = encoding.codec.state.encode( state );
      t.deepEqual( encoding.codec.state.decode( encoded ), state, encoded );
    });

    t.end();
  });
};
