
var Placeholder = require('../Placeholder');

module.exports.functional = function(test, util) {

  // load data
  var ph = new Placeholder();
  ph.load();

  var assert = runner.bind(null, test, ph);

  assert('Kelbur\x26', [85772991, 1326645067]);
  assert('Kelburn\x26', [85772991, 1326645067]);
  assert('Kelburn W\x26', [85772991]);
  assert('Kelburn Well\x26', [85772991]);
  assert('Kelburn Wellington\x26', [85772991]);
  assert('Kelburn Wellington New\x26', [85772991]);
  assert('Kelburn Wellington New Z\x26', [85772991]);
  assert('Kelburn Wellington New Zeal\x26', [85772991]);
  assert('Kelburn Wellington New Zealand\x26', [85772991]);
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
