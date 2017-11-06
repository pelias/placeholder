const query = require('../../prototype/query');

module.exports.exports = function(test, common) {
  test('exports', function(t) {
    t.equal( typeof query.query, 'function' );
    t.end();
  });
};
