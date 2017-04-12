
var analysis = require('../../lib/analysis');

module.exports.normalize = function(test, common) {
  var assert = runner.bind(null, test, 'normalize');

  // Germanic substitutions
  assert( 'Schöneberg', [ 'schoneberg', 'schoeneberg' ] );

  // Punctuation substitutions
  assert( 'Straße', [ 'strasse' ] );
  assert( 'Trinidad & Tobago', [ 'trinidad and tobago' ] );
};

module.exports.tokenize = function(test, common) {
  var assert = runner.bind(null, test, 'tokenize');

  // delimiters
  assert( 'Foo  Bar', [[ 'foo', 'bar' ]] );
  assert( 'Foo,,Bar', [[ 'foo', 'bar' ]] );
  assert( 'Foo\'\'Bar', [[ 'foobar' ], [ 'foo', 'bar' ]] );
  assert( 'Foo""Bar', [[ 'foo', 'bar' ]] );

  // not a delimeter
  assert( 'Foo..Bar', [[ 'foobar' ]] );
  assert( 'West L.A.', [[ 'west', 'la' ]] );

  // synonymous punctuation
  assert( 'Foo-Bar', [[ 'foobar' ], [ 'foo', 'bar' ]] );
  assert( 'Tol\'yatti', [[ 'tolyatti' ], [ 'tol', 'yatti' ]] );
  assert( 'Sendai-shi', [[ 'sendaishi' ], [ 'sendai', 'shi' ]] );
};

// convenience function for writing quick 'n easy test cases
function runner( test, method, actual, expected ){
  test( actual, function(t) {
    t.deepEqual( analysis[method]( actual ), expected );
    t.end();
  });
}
