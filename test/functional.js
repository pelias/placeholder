
var Placeholder = require('../Placeholder');

module.exports.tokenize = function(test, util) {

  // load data
  var ph = new Placeholder();
  ph.load();

  var assert = runner.bind(null, test, ph);

  assert('Kelburn Wellington New Zealand', [85772991]);
  assert('North Sydney', [85771181, 85784821, 101931469, 102048877, 404225393]);
  assert('Sydney New South Wales Australia', [101932003, 102049151, 404226357]);
  assert('ケープタウン 南アフリカ', [101928027]);
  assert('경기도 광명시', [890472589]);
  assert('서울 마포구', [890473201]);
  assert('부산광역시 부산진구', [890475779]);
  assert('전라북도 전주시 완산구', [890476473]);

  assert('london on', [ 101735809 ]);
  assert('paris, tx', [ 101725293 ]);

  assert('123 apple bay ave neutral bay north sydney new south wales au',
    [ 85774601, 101931387, 404225267 ]
  );

  assert('30 w 26th st ny nyc 10117 ny usa', [ 85977539 ]);

  // should not include county: 102081377, or localadmin: 404482867
  assert('lancaster lancaster pa', [ 101718643, 404487183, 404487185 ]);
};

// convenience function for writing quick 'n easy test cases
function runner( test, ph, actual, expected ){
  test( actual, function(t) {
    ph.query( actual, ( err, ids, mask, group ) => {
      t.deepEqual( ids, expected );
      t.end();
    });
  });
}
