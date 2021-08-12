
var Placeholder = require('../Placeholder');

module.exports.functional = function(test, util) {

  // load data
  var ph = new Placeholder();
  ph.load();

  var assert = runner.bind(null, test, ph);

  assert('Kelbur\x26', [1326645067, 1729339019]);
  assert('Kelburn\x26', [1326645067, 1729339019]);
  assert('Kelburn W\x26', [1729339019]);
  assert('Kelburn Well\x26', [1729339019]);
  assert('Kelburn Wellington\x26', [1729339019]);
  assert('Kelburn Wellington New\x26', [1729339019]);
  assert('Kelburn Wellington New Z\x26', [1729339019]);
  assert('Kelburn Wellington New Zeal\x26', [1729339019]);
  assert('Kelburn Wellington New Zealand\x26', [1729339019]);
};

// convenience function for writing quick 'n easy test cases
function runner( test, ph, actual, expected ){
  test( actual, function(t) {
    ph.query( actual, ( err, res ) => {
      t.deepEqual( res.getIdsAsArray(), expected );
      t.end();
    });
  });
}
