
var path = require('path'),
    Placeholder = require('../../Placeholder');

module.exports.tokenize = function(test, util) {

  // load data
  var ph = new Placeholder();
  ph.load( path.join( __dirname, '../../graph/graph.json' ) );

  var assert = runner.bind(null, test, ph);

  assert('Kelburn Wellington New Zealand', [['kelburn', 'wellington', 'new zealand']]);
  assert('North Sydney', [['north sydney']]);
  assert('Sydney New South Wales Australia', [['sydney', 'new south wales', 'australia']]);
  assert('ケープタウン 南アフリカ', [['ケープタウン', '南アフリカ']]);
  assert('neutral bay north sydney', [['neutral bay', 'north sydney']]);

  // duplicates
  assert('bay ave neutral bay north sydney', [['bay', 'neutral bay', 'north sydney']]);
  assert('mitte mitte berlin de', [['mitte', 'mitte berlin', 'de']]);
  assert('lancaster lancaster pa', [['lancaster', 'lancaster', 'pa']]);
};

// convenience function for writing quick 'n easy test cases
function runner( test, ph, actual, expected ){
  test( actual, function(t) {
    t.deepEqual( ph.tokenize( actual ), expected );
    t.end();
  });
}
