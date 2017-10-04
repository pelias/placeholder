
var Database = require('../../wip/Database');
var State = require('../../wip/State');

function createIndex(){
  return new Database( '/tmp/' + Math.random().toString(36).substring(7) );
}

module.exports.interface = function(test, util) {
  test('interface', function(t) {
    t.equal(typeof Database, 'function');
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

module.exports.hasSubject = function(test, util) {
  test('interfaces', function(t) {
    const idx = createIndex();
    t.equal(typeof idx.hasSubject, 'function');
    t.end();
  });
  test('hasSubject', function(t) {
    const idx = createIndex();
    const states = [
      new State( 'a', 'b', 1 ),
      new State( 'a', 'c', 1 ),
      new State( 'b', 'c', 2 )
    ];

    t.plan(4);
    idx.putStateMany( states, ( err ) => {
      t.false( err );
      idx.hasSubject( 'a', t.true );
      idx.hasSubject( 'b', t.true );
      idx.hasSubject( 'c', t.false );
    });
  });
};

module.exports.hasSubjectObject = function(test, util) {
  test('interfaces', function(t) {
    const idx = createIndex();
    t.equal(typeof idx.hasSubjectObject, 'function');
    t.end();
  });
  test('matchSubject', function(t) {
    const idx = createIndex();
    const states = [
      new State( 'a', 'b', 1 ),
      new State( 'a', 'c', 1 ),
      new State( 'b', 'c', 2 )
    ];

    t.plan(5);
    idx.putStateMany( states, ( err ) => {
      t.false( err );
      idx.hasSubjectObject( 'a', 'b', t.true );
      idx.hasSubjectObject( 'a', 'c', t.true );
      idx.hasSubjectObject( 'b', 'c', t.true );
      idx.hasSubjectObject( 'b', 'a', t.false );
    });
  });
};

module.exports.matchSubject = function(test, util) {
  test('interfaces', function(t) {
    const idx = createIndex();
    t.equal(typeof idx.matchSubject, 'function');
    t.end();
  });
  test('matchSubject', function(t) {
    const idx = createIndex();
    const states = [
      new State( 'a', 'b', 1 ),
      new State( 'a', 'c', 1 ),
      new State( 'b', 'c', 2 )
    ];

    t.plan(7);
    idx.putStateMany( states, ( err ) => {
      t.false( err );
      idx.matchSubject( 'a', function( err, match ){
        t.false( err );
        t.deepEqual( match, [
          { subject: 'a', object: 'b', id: 1, value: null },
          { subject: 'a', object: 'c', id: 1, value: null }
        ]);
      });
      idx.matchSubject( 'b', function( err, match ){
        t.false( err );
        t.deepEqual( match, [
          { subject: 'b', object: 'c', id: 2, value: null }
        ]);
      });
      idx.matchSubject( 'c', function( err, match ){
        t.false( err );
        t.deepEqual( match, {} );
      });
    });
  });
};

module.exports.matchSubjectObject = function(test, util) {
  test('interfaces', function(t) {
    const idx = createIndex();
    t.equal(typeof idx.matchSubjectObject, 'function');
    t.end();
  });
  test('matchSubjectObject', function(t) {
    const idx = createIndex();
    const states = [
      new State( 'a', 'b', 1 ),
      new State( 'a', 'c', 1 ),
      new State( 'b', 'c', 2 )
    ];

    t.plan(7);
    idx.putStateMany( states, ( err ) => {
      t.false( err );
      idx.matchSubjectObject( 'a', 'b', function( err, match ){
        t.false( err );
        t.deepEqual( match, [
          { subject: 'a', object: 'b', id: 1, value: null }
        ]);
      });
      idx.matchSubjectObject( 'b', 'c', function( err, match ){
        t.false( err );
        t.deepEqual( match, [
          { subject: 'b', object: 'c', id: 2, value: null }
        ]);
      });
      idx.matchSubjectObject( 'b', 'a', function( err, match ){
        t.false( err );
        t.deepEqual( match, {} );
      });
    });
  });
};

module.exports.intersectSubject = function(test, util) {
  test('interfaces', function(t) {
    const idx = createIndex();
    t.equal(typeof idx.intersectSubject, 'function');
    t.end();
  });
  test('intersectSubject', function(t) {
    const idx = createIndex();
    const states = [
      new State('paris', 'texas', 3),
      new State('paris', 'france', 3),
      new State('pizza', 'france', 3),
      new State('paris', '', 40),
      new State('pizza', '', 40)
    ];

    t.plan(2);
    idx.putStateMany( states, ( err ) => {
      t.false( err );
      idx.intersectSubject( 'paris', 'pizza', ( err, res ) => {
        t.deepEqual( res, [
          { subject: 'paris', object: '',       id: 40, value: null },
          { subject: 'paris', object: 'france', id: 3,  value: null }
        ]);
        t.end();
      });
    });
  });
};
