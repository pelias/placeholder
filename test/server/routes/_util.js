
var util = require('../../../server/routes/_util');

module.exports.arrayParam = function(test, common) {
  test('arrayParam', function(t) {
    t.deepEqual( util.arrayParam(undefined), [], 'undefined' );
    t.deepEqual( util.arrayParam(null), [], 'null' );
    t.deepEqual( util.arrayParam(''), [], 'empty' );
    t.deepEqual( util.arrayParam([]), [], 'empty array' );
    t.deepEqual( util.arrayParam(['a ', ' b']), ['a','b'], 'array' );
    t.deepEqual( util.arrayParam(' test '), ['test'], 'simple string' );
    t.deepEqual( util.arrayParam(' test, foo '), ['test','foo'], 'delimited string' );
    t.end();
  });
};
