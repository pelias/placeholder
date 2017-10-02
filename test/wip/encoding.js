
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
    t.equal(typeof encoding.byte.delim, 'string');
    t.deepEqual(encoding.byte.empty, null);
    t.equal(typeof encoding.byte.start, 'string');
    t.equal(typeof encoding.byte.end, 'string');
    t.end();
  });
};

module.exports.fmt = function(test, util) {
  test('fmt', function(t) {
    t.equal(typeof encoding.fmt.token, 'string');
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
    function encode( id ){ return encoding.codec.id.encode(id).toString('utf8'); }
    t.equal( encode( 1 ), '\x01\x00\x00\x00' );
    t.equal( encode( 37846327 ), '7}A\x02' );
    t.end();
  });
  test('codec - id - decode', function(t) {
    function decode( str ){ return encoding.codec.id.decode(str); }
    t.deepEqual( decode( '\x01\x00\x00\x00' ), 1 );
    t.deepEqual( decode( '7}A\x02' ), 37846327 );
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
    function encode( state ){ return encoding.codec.state.encode(state).toString('utf8'); }
    t.equal( encode( new State( 'foo', 'bar', 1 ) ), 'foo\x02bar\x03\x01\x00\x00\x00' );
    t.equal( encode( new State( 'long word', 'next word', 37846327 ) ), 'long word\x02next word\x037}A\x02' );
    t.end();
  });
  test('codec - state - decode', function(t) {
    function decode( str ){ return encoding.codec.state.decode(str); }
    t.deepEqual( decode( 'foo\x02bar\x03\x01\x00\x00\x00' ), new State( 'foo', 'bar', 1 ) );
    t.deepEqual( decode( 'long word\x02next word\x037}A\x02' ), new State( 'long word', 'next word', 37846327 ) );
    t.end();
  });
};
