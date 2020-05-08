
var Placeholder = require('../Placeholder');

module.exports.functional = function(test, util) {

  // load data
  var ph = new Placeholder();
  ph.load();

  var assert = runner.bind(null, test, ph);

  assert('Kelburn Wellington New Zealand', [85772991]);
  assert('North Sydney', [85784821, 101931469, 102048877, 404225393, 1310698409]);
  assert('Sydney New South Wales Australia', [101932003, 102049151, 404226357, 1376953385, 1377004395]);
  assert('ケープタウン 南アフリカ', [101928027]);

  // possible duplicates
  // see: https://github.com/whosonfirst-data/whosonfirst-data/issues/1841
  assert('경기도 광명시', [102026551, 890472589]);
  assert('부산광역시 부산진구', [890475779, 890476045]);

  assert('서울 마포구', [890473201]);
  assert('전라북도 전주시 완산구', [102026471]);

  assert('london on', [ 101735809 ]);
  assert('paris, tx', [ 101725293 ]);

  assert('123 apple bay ave neutral bay north sydney new south wales au',
    [ 101931387, 404225267 ]
  );

  assert('30 w 26th st ny nyc 10117 ny usa', [ 85977539 ]);

  // should not include county: 102081377, or localadmin: 404482867
  assert('lancaster lancaster pa', [ 101718643, 404487183, 404487185 ]);

  // assertions from pelias acceptance-test suite
  assert('灣仔, 香港', [85671779, 1243098523]);
  assert('new york city, usa', [85977539]);
  assert('sendai, japan', [102031919, 1108739995, 1125901991, 1243269829]);
  assert('Észak-Alföld', [404227483]);
  assert('Comunidad Foral De Navarra, ES', [404227391]);
  assert('Île-De-France, France', [404227465]);
  assert('Dél-Dunántúl, HU', [404227491]);
  assert('Sardegna, Italy', [404227535]);
  assert('Közép-Magyarország, Hungary', [404227489]);
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
