
var analysis = require('../../lib/analysis');

module.exports.normalize = function(test, common) {
  var assert = runner.bind(null, test, 'normalize');

  // Germanic substitutions
  assert( 'Schöneberg', [ 'schoneberg', 'schoeneberg' ] );

  // apostrophe s
  assert( 'St. George\'s', [ 'st georges', 'st george' ] );
  assert( 'St. George\‘s', [ 'st georges', 'st george' ] );
  assert( 'St. George\’s', [ 'st georges', 'st george' ] );

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
  assert( 'SainT token sAiNt value saInt', [ 'st token st value st' ] );
  assert( 'SaintE token sAinTe value saINte', [ 'ste token ste value ste' ] );
  assert( 'FoRt token fORt value fOrT', [ 'ft token ft value ft' ] );
  assert( 'MoUNt token mOUNt value mouNT', [ 'mt token mt value mt' ] );

  // Synonym contractions - hyphens
  assert( 'Foo-Sainte-Bar', [ 'foostebar', 'foo ste bar' ] );
  assert( 'Foo-Saint-Bar', [ 'foostbar', 'foo st bar' ] );
  assert( 'Foo-Mount-Bar', [ 'foomtbar', 'foo mt bar' ] );
  assert( 'Foo-Fort-Bar', [ 'fooftbar', 'foo ft bar' ] );

  // Synonym - with/without official designation
  assert( 'County', [ 'county' ] );
  assert( 'County Durham', [ 'county durham', 'durham' ] );
  assert( 'County of Durham', [ 'county of durham', 'durham' ] );
  assert( 'Durham County', [ 'durham county', 'durham' ] );
  assert( 'County Two Words', [ 'county two words', 'two words' ] );
  assert( 'County of Two Words', [ 'county of two words', 'two words' ] );
  assert( 'Two Words County', [ 'two words county', 'two words' ] );

  assert( 'City', [ 'city' ] );
  assert( 'City London', [ 'city london' ] );
  assert( 'City of London', [ 'city of london', 'london' ] );
  assert( 'London City', [ 'london city' ] );
  assert( 'City Salt Lake', [ 'city salt lake' ] );
  assert( 'City of Salt Lake', [ 'city of salt lake', 'salt lake' ] );
  assert( 'New York City', [ 'new york city' ] );
  assert( 'City New York', [ 'city new york' ] );
  assert( 'City of New York', [ 'city of new york', 'new york' ] );
  assert( 'New York City', [ 'new york city' ] );

  assert( 'City of the Sun', [ 'city of the sun' ] );
  assert( 'City of Sun', [ 'city of sun', 'sun' ] );

  // remove 'disambiguation' tokens from name suffix
  // see: https://github.com/whosonfirst-data/whosonfirst-data/issues/885
  assert( 'St Kilda (Vic.)', [ 'st kilda' ] );
  assert( 'Spring Mountain (Qld)', [ 'spring mountain' ] );
  assert( 'Mónaco - Monaco', [ 'monaco' ] );
  assert( 'Monako (peyi)', [ 'monako' ] );
  assert( 'Monako [peyi]', [ 'monako' ] );
  assert( 'Port Phillip (C)', [ 'port phillip' ] );
  assert( 'Portland (Oregon)', [ 'portland' ] );
  assert( 'Sutherland Shire (A)', [ 'sutherland shire' ] );
  assert( 'Cocos- [Keeling] eilande', [ 'cocos' ] );

  // remove tokens that *only* contain numbers
  assert( '1', [] );
  assert( '22', [] );
  assert( '333', [] );
  assert( '22nd', ['22nd'] );
  assert( 'a12', ['a12'] );
  assert( '-1', [] ); // special case: handle '-1' values
  assert( '1 -1', [] );
  assert( '1 --1', [] );
  assert( '1 (foo)', [] );
  assert( '1 [foo]', [] );
};

module.exports.tokenize = function(test, common) {
  var assert = runner.bind(null, test, 'tokenize');

  // invalid type
  assert( [], [] );
  assert( {}, [] );

  // delimiters
  assert( 'Foo  Bar', [[ 'foo', 'bar' ]] );
  assert( 'Foo,,Bar', [[ 'foo', 'bar' ]] );
  assert( 'Foo\'\'Bar', [[ 'foobar' ], [ 'foo', 'bar' ]] );
  assert( 'Foo‘‘Bar', [[ 'foobar' ], [ 'foo', 'bar' ]] );
  assert( 'Foo’’Bar', [[ 'foobar' ], [ 'foo', 'bar' ]] );
  assert( 'Foo\'’’Bar', [[ 'foobar' ], [ 'foo', 'bar' ]] );
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
