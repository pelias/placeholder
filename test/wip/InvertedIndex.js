
var memdown = require('memdown');
var InvertedIndex = require('../../wip/InvertedIndex');
var State = require('../../wip/State');

function createIndex(){
  memdown.clearGlobalStore();
  return new InvertedIndex( 'test', { db: memdown } );
}

module.exports.interface = function(test, util) {
  test('interface', function(t) {
    t.equal(typeof InvertedIndex, 'function');
    t.end();
  });
  test('instance', function(t) {
    const idx = createIndex();
    
    t.equal(typeof idx, 'object');
    t.end();
  });
};

module.exports.putState = function(test, util) {
  test('interfaces', function(t) {
    const idx = createIndex();
    t.equal(typeof idx.putState, 'function');
    t.equal(typeof idx.getStateValue, 'function');
    t.end();
  });
  test('putState', function(t) {
    const idx = createIndex();
    const state = new State( 'a', 'b', 1 );    

    idx.putState( state, ( err ) => {
      t.false( err );
      t.end();
    });
  });
  test('putState - getState', function(t) {
    var idx = createIndex();
    const state = new State( 'a', 'b', 1, 'testing' );

    idx.putState( state, ( err ) => {
      t.false( err );
      
      idx.getStateValue( state, ( err2, value ) => {
        t.false( err2 );
        t.deepEqual( value, state.value );
        t.end();
      });
    });
  });
  test('putState - getState - default value', function(t) {
    var idx = createIndex();
    const state = new State( 'a', 'b', 1 );

    idx.putState( state, ( err ) => {
      t.false( err );

      idx.getStateValue( state, ( err2, value ) => {
        t.false( err2 );
        t.deepEqual( value, '' );
        t.end();
      });
    });
  });
};

module.exports.putStateMany = function(test, util) {
  test('interfaces', function(t) {
    const idx = createIndex();
    t.equal(typeof idx.putStateMany, 'function');
    t.equal(typeof idx.getStateValueMany, 'function');
    t.end();
  });
  test('putStateMany', function(t) {
    const idx = createIndex();
    const states = [
      new State( 'a', 'b', 1 ),
      new State( 'a', 'c', 1 ),
      new State( 'b', 'c', 2 )
    ];
    
    idx.putStateMany( states, ( err ) => {
      t.false( err );
      t.end();
    });
  });
  test('putStateMany - getStateMany', function(t) {
    var idx = createIndex();
    const states = [
      new State( 'a', 'b', 1, 'test1' ),
      new State( 'a', 'c', 1, 'test2' ),
      new State( 'b', 'c', 2, 'test3' )
    ];

    idx.putStateMany( states, ( err ) => {
      t.false( err );

      idx.getStateValueMany( states, ( err2, values ) => {
        t.false( err2 );
        values.forEach(( val, pos ) => {
          t.equal( val, states[pos].value );
        });
        t.end();
      });
    });
  });
};
