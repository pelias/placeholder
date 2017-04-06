
var path = require('path'),
    Placeholder = require('../../Placeholder');

module.exports.query = function(test, util) {

  // load data
  var ph = new Placeholder();
  ph.load( path.join( __dirname, '../../graph/graph.json' ) );

  var assert = runner.bind(null, test, ph);

  assert([['kelburn', 'wellington', 'new zealand']], [85772991]);
  assert([['north sydney']], [85771181, 85784821, 101931469, 102048877, 404225393]);
  assert([['sydney', 'new south wales', 'australia']], [101932003, 404226357]);
  assert([['ケープタウン', '南アフリカ']], [101928027]);
};

// convenience function for writing quick 'n easy test cases
function runner( test, ph, actual, expected ){
  test( actual, function(t) {
    t.deepEqual( ph.query( actual ), expected );
    t.end();
  });
}
