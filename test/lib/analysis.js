
var analysis = require('../../lib/analysis');

module.exports.normalize = function(test, common) {
  var assert = runner.bind(null, test, 'normalize');

  // German umlaut multiple expansion
  // assert( 'Schöneberg', [ 'schoneberg', 'schoeneberg' ] );
};

module.exports.tokenize = function(test, common) {
  var assert = runner.bind(null, test, 'tokenize');

  // delimiters
  assert( 'Foo  Bar', [[ 'foo', 'bar' ]] );
  assert( 'Foo,,Bar', [[ 'foo', 'bar' ]] );
  assert( 'Foo..Bar', [[ 'foo', 'bar' ]] );
  assert( 'Foo\'\'Bar', [[ 'foo', 'bar' ]] );
  assert( 'Foo""Bar', [[ 'foo', 'bar' ]] );

  // not a delimeter
  assert( 'Foo-Bar', [[ 'foo-bar' ]] );
};

// convenience function for writing quick 'n easy test cases
function runner( test, method, actual, expected ){
  test( actual, function(t) {
    t.deepEqual( analysis[method]( actual ), expected );
    t.end();
  });
}
