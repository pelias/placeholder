
var Placeholder = require('../../Placeholder');

module.exports.tokenize = function(test, util) {

  // load data
  var ph = new Placeholder();
  ph.load();

  var assert = runner.bind(null, test, ph);

  assert('Kelburn Wellington New Zealand', [['kelburn', 'wellington', 'new zealand']]);
  assert('Sydney New South Wales Australia', [['sydney', 'new south wales', 'australia']]);
  assert('ケープタウン 南アフリカ', [['ケープタウン', '南アフリカ']]);

  // duplicates
  assert('lancaster lancaster pa', [['lancaster', 'lancaster', 'pa']]);

  // synonymous groupings
  // see: https://github.com/pelias/placeholder/issues/28
  assert('Le Cros-d’Utelle, France', [['le cros','d','utelle','france']]);
  assert('luxemburg luxemburg', [['luxemburg', 'luxemburg']]); // does not remove duplicate tokens

  // ambiguous parses
  // @note: these are the glorious future:

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
    t.deepEqual( ph.tokenize( actual ), expected );
    t.end();
  });
}
