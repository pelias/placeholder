
var permutations = require('../../lib/permutations');

module.exports.permutations = function(test, common) {
  test('permutations', function(t) {

    var input = [ 'soho', 'new', 'york', 'usa' ];
    var expected = [
      [ 'soho', 'new', 'york', 'usa' ],
      [ 'soho', 'new', 'york' ],
      [ 'soho', 'new' ],
      [ 'soho' ],
      [ 'new', 'york', 'usa' ],
      [ 'new', 'york' ],
      [ 'new' ],
      [ 'york', 'usa' ],
      [ 'york' ],
      [ 'usa' ]
    ];

    t.deepEqual( permutations.expand( input ), expected );
    t.end();
  });
};
