
var Placeholder = require('../../Placeholder');

module.exports.tokenize = function(test, util) {

  // load data
  var ph = new Placeholder();
  ph.load();

  var assert = runner.bind(null, test, ph);

  assert('Kelburn Wellington New Zealand', [['kelburn', 'wellington', 'new zealand']]);
  assert('Sydney New South Wales Australia', [['sydney', 'new south wales', 'australia']]);
  assert('ケープタウン 南アフリカ', [['ケーフタウン', '南アフリカ']]);

  // duplicates
  assert('lancaster lancaster pa', [['lancaster', 'lancaster', 'pa']]);

  // korean place names
  assert('세종특별자치시', [['세종특별자치시']]);

  // synonymous groupings
  // see: https://github.com/pelias/placeholder/issues/28
  // note: the 'Le Cros-d’Utelle, France' example (as at 20-09-17) no longer dedupes
  // to a single grouping due to the introduction of the token 'le' from 85685547
  assert('Le Cros-d’Utelle, France', [['le crosdutelle', 'france' ], [ 'le cros d utelle', 'france']]);
  assert('luxemburg luxemburg', [['luxemburg', 'luxemburg']]); // does not remove duplicate tokens

  // ambiguous parses
  // @note: these are the glorious future:

  // assert('Adams North Brunswick', [
  //   [ 'adams north', 'brunswick' ],
  //   [ 'adams', 'north brunswick' ]
  // ]);
  //
  // assert('Heritage East San Jose', [
  //   [ 'heritage east', 'san jose' ],
  //   [ 'heritage', 'east san jose' ]
  // ]);
  //
  // assert('bay ave neutral bay north sydney', [
  //   [ 'bay', 'neutral bay', 'north sydney' ],
  //   [ 'bay', 'neutral bay', 'north', 'sydney' ]
  // ]);
  //
  // assert('mitte mitte berlin de', [
  //   [ 'mitte berlin', 'de' ],
  //   [ 'mitte', 'mitte berlin', 'de' ],
  //   [ 'mitte', 'mitte', 'berlin', 'de' ]
  // ]);
  //
  // assert('North Sydney', [
  //   [ 'north sydney' ],
  //   [ 'north', 'sydney' ]
  // ]);
  //
  // assert('neutral bay north sydney', [
  //   [ 'neutral bay', 'north sydney' ],
  //   [ 'neutral bay', 'north', 'sydney' ]
  // ]);
};

// convenience function for writing quick 'n easy test cases
function runner( test, ph, actual, expected ){
  test( actual, function(t) {
    ph.tokenize( actual, ( err, queries ) => {
      t.deepEqual( queries, expected );
      t.end();
    });
  });
}
