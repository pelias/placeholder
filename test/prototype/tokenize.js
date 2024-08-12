
const tokenize = require('../../prototype/tokenize');
const PARTIAL_TOKEN_SUFFIX = require('../../lib/analysis').PARTIAL_TOKEN_SUFFIX;

module.exports.exports = function(test, common) {
  test('exports', function(t) {
    t.equal( typeof tokenize.tokenize, 'function' );
    t.equal( typeof tokenize._indexContainsPhrase, 'function' );
    t.equal( typeof tokenize._eachSynonym, 'function' );
    t.equal( typeof tokenize._permutations, 'function' );
    t.equal( typeof tokenize._queryFilter, 'function' );
    t.equal( typeof tokenize._isArrayRangeIsEqual, 'function' );
    t.equal( typeof tokenize._groups, 'function' );
    t.end();
  });
};

// test if a phrase exists in the index
module.exports._indexContainsPhrase = function(test, common) {
  test('_indexContainsPhrase - true', function(t) {
    t.plan(3);
    var mock = tokenize._indexContainsPhrase.bind({
      index: { hasSubject: ( phrase, cb ) => {
        t.equals(phrase, 'hello world');
        return cb( true );
      }}
    });

    mock('hello world', (err, bool) => {
      t.false(err);
      t.true(bool);
    });
  });
  test('_indexContainsPhrase - false', function(t) {
    t.plan(3);
    var mock = tokenize._indexContainsPhrase.bind({
      index: { hasSubject: ( phrase, cb ) => {
        t.equals(phrase, 'hello world');
        return cb( false );
      }}
    });

    mock('hello world', (err, bool) => {
      t.false(err);
      t.false(bool);
    });
  });
  test('_indexContainsPhrase - partial token - true', function(t) {
    t.plan(3);
    var mock = tokenize._indexContainsPhrase.bind({
      index: { hasSubject: ( phrase, cb ) => {
        t.equals(phrase, 'hello world' + PARTIAL_TOKEN_SUFFIX);
        return cb( true );
      }}
    });

    mock('hello world' + PARTIAL_TOKEN_SUFFIX, (err, bool) => {
      t.false(err);
      t.true(bool);
    });
  });
  test('_indexContainsPhrase - partial token - false', function(t) {
    t.plan(3);
    var mock = tokenize._indexContainsPhrase.bind({
      index: { hasSubject: ( phrase, cb ) => {
        t.equals(phrase, 'hello world' + PARTIAL_TOKEN_SUFFIX);
        return cb( false );
      }}
    });

    mock('hello world' + PARTIAL_TOKEN_SUFFIX, (err, bool) => {
      t.false(err);
      t.false(bool);
    });
  });
};

// expand each synonym in to its permutations and check them against the database.
module.exports._eachSynonym = function(test, common) {
  test('_eachSynonym', function(t) {

    const synonym = ['hello', 'big', 'bright', 'new', 'world'];
    const expected = [ 'hello big', 'bright', 'new world' ];

    var mock = tokenize._eachSynonym.bind({
      index: { hasSubject: ( phrase, cb ) => {
        switch( phrase ){
          case 'hello big':
          case 'hello new':
          case 'new world':
          case 'bright':
          case 'world':
            return cb( true );
          default:
            return cb( false );
        }
      }}
    });

    mock(synonym, (err, phrases) => {
      t.false(err);
      t.deepEqual(phrases, expected);
      t.end();
    });
  });
};

// _permutations takes an array of input tokens and produces
// an output array consisting of all the potential adjancent
// groupings of the input tokens up to the defined threshold.
module.exports._permutations = function(test, common) {
  test('_permutations', function(t) {

    const tokens = ['new', 'south', 'wales'];
    const expected = [
      'new south wales',
      'new south',
      'new',
      'south wales',
      'south',
      'wales'
    ];

    t.deepEqual(tokenize._permutations(tokens), expected);
    t.end();
  });
};

// _queryFilter removes unwanted queries from the array before
// they are returned to the caller.
module.exports._queryFilter = function(test, common) {
  test('_queryFilter - remove empty arrays', function(t) {

    const queries = [[], ['a'], [], ['b','c'], [], ['d'], []];
    const expected = [['a'], ['b','c'], ['d']];

    t.deepEqual(tokenize._queryFilter(queries), expected);
    t.end();
  });

  // synonymous groupings
  // this removes queries such as `[ B, C ]` where another group such as
  // `[ A, B, C ]` exists.
  // see: https://github.com/pelias/placeholder/issues/28
  test('_queryFilter - synonymous groupings', function(t) {

    const queries = [
      ['A','B','C','D'], ['B','C','D'], ['C','D'], ['D'],
      ['A','B','C'], ['B','C'], ['C'],
      ['A','B']
    ];
    const expected = [
      ['A','B','C','D'],
      ['A','B','C'],
      ['A','B']
    ];

    t.deepEqual(tokenize._queryFilter(queries), expected);
    t.end();
  });
};

// _groups takes an array of input tokens, the tokens are first run through
// the _permutations function above, each permutation is looked up in the db.
// this function aims to select the best permutations to use for the query.
// note: it strongly favours the longer token groupings
module.exports._groups = function(test, common) {
  test('_groups', function(t) {

    const tokens = ['north', 'sydney', 'new', 'south', 'wales', 'au'];
    const phrases = [
      'south wales','new south wales', 'wales', 'north', 'sydney',
      'north sydney', 'south', 'au'
    ];
    const expected = ['north sydney', 'new south wales', 'au'];

    t.deepEqual(tokenize._groups(tokens, phrases), expected);
    t.end();
  });

  // https://github.com/pelias/placeholder/issues/231
  test('_groups "constructor"', function(t) {

    const tokens = ['constructor'];
    const phrases = [];
    const expected = [];

    t.deepEqual(tokenize._groups(tokens, phrases), expected);
    t.end();
  });
};

// 
module.exports._isArrayRangeIsEqual = function(test, common) {
  test('_isArrayRangeIsEqual', function(t) {

    const A = [1, 2, 3, 1, 2, 3];
    const B = [1, 2];
    const C = [3];

    t.true(tokenize._isArrayRangeIsEqual(A, B));
    t.true(tokenize._isArrayRangeIsEqual(A, B, 0));
    t.true(tokenize._isArrayRangeIsEqual(A, B, 3));
    t.false(tokenize._isArrayRangeIsEqual(A, B, 1));
    t.false(tokenize._isArrayRangeIsEqual(A, B, 2));
    t.false(tokenize._isArrayRangeIsEqual(A, B, 4));
    t.false(tokenize._isArrayRangeIsEqual(A, B, 5));
    t.false(tokenize._isArrayRangeIsEqual(A, B, 6));
    t.false(tokenize._isArrayRangeIsEqual(A, B, -1));
    t.false(tokenize._isArrayRangeIsEqual(A, B, Infinity));

    t.true(tokenize._isArrayRangeIsEqual(A, C, 2));
    t.true(tokenize._isArrayRangeIsEqual(A, C, 5));
    t.false(tokenize._isArrayRangeIsEqual(A, C));
    t.false(tokenize._isArrayRangeIsEqual(A, C, 0));
    t.false(tokenize._isArrayRangeIsEqual(A, C, 1));
    t.false(tokenize._isArrayRangeIsEqual(A, C, 3));
    t.false(tokenize._isArrayRangeIsEqual(A, C, 4));
    t.false(tokenize._isArrayRangeIsEqual(A, C, 6));
    t.false(tokenize._isArrayRangeIsEqual(A, C, -1));
    t.false(tokenize._isArrayRangeIsEqual(A, C, Infinity));
    
    t.end();
  });
};

