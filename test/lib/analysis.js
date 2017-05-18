
var analysis = require('../../lib/analysis');

module.exports.normalize = function(test, common) {
  var assert = runner.bind(null, test, 'normalize');

  // Germanic substitutions
  assert( 'Schöneberg', [ 'schoneberg', 'schoeneberg' ] );

  // apostrophe s
  assert( 'St. George\'s', [ 'st georges', 'st george' ] );

  // Punctuation substitutions
  assert( 'Straße', [ 'strasse' ] );
  assert( 'Jǿ œ̆', [ 'jo oe' ] );
  assert( 'Trinidad & Tobago', [ 'trinidad and tobago' ] );

  // Tests to confirm the order of function execution
  // see: https://github.com/pelias/placeholder/pull/12#issuecomment-302437570
  test( 'order of execution', function(t) {
    t.deepEqual( analysis.normalize( 'İnceyol' ), [ 'i̇nceyol' ] );
    t.equal( analysis.normalize( 'İnceyol' )[0].length, 8 );
    t.equal( analysis.normalize( 'İ' )[0].length, 2 );
    t.end();
  });

  // Synonym contractions
  assert( 'SainT city sAiNt value saInt', [ 'st city st value st' ] );
  assert( 'SaintE city sAinTe value saINte', [ 'ste city ste value ste' ] );
  assert( 'FoRt city fORt value fOrT', [ 'ft city ft value ft' ] );
  assert( 'MoUNt city mOUNt value mouNT', [ 'mt city mt value mt' ] );

  // Synonym contractions - hyphens
  assert( 'Foo-Sainte-Bar', [ 'foostebar', 'foo ste bar' ] );
  assert( 'Foo-Saint-Bar', [ 'foostbar', 'foo st bar' ] );
  assert( 'Foo-Mount-Bar', [ 'foomtbar', 'foo mt bar' ] );
  assert( 'Foo-Fort-Bar', [ 'fooftbar', 'foo ft bar' ] );
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
