
var wof = require('../../prototype/wof');

// ----
var Mock = function(){
  // store all function calls here for
  // later inspection during tests
  var calls = { addToken: [], setEdge: [], set: [] };
  this._calls = calls;

  // mock methods
  this.graph = {
    addToken: function(){ calls.addToken.push( arguments ); },
    setEdge: function(){ calls.setEdge.push( arguments ); }
  };
  this.store = {
    set: function( _, __, next ){
      calls.set.push( Array.prototype.slice.call( arguments, 0, 2 ) );
      next();
    }
  };
};
Mock.prototype.insertWofRecord = wof.insertWofRecord;
// ----

module.exports.store_record = function(test, util) {

  test( 'empty data', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({}, function(){
      t.deepEqual( mock._calls.addToken, [] );
      t.deepEqual( mock._calls.setEdge, [] );
      t.deepEqual( mock._calls.set, [] );
      t.end();
    });
  });

  test( 'id only', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.addToken, [] );
      t.deepEqual( mock._calls.setEdge, [] );
      t.deepEqual( mock._calls.set, [[
        1, {
          id: 1,
          name: undefined,
          names: {},
          placetype: undefined,
          population: undefined,
          abbr: undefined,
          lineage: undefined,
          geom: {
            area: undefined,
            bbox: undefined,
            lat: undefined,
            lon: undefined
          }
        }
      ]]);
      t.end();
    });
  });
};

module.exports.store_default_name = function(test, util) {

  test( 'name: no name', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].name, undefined);
      t.end();
    });
  });

  test( 'name: prefer label', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'wof:label': 'A',
      'wof:name': 'B'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].name, 'A');
      t.end();
    });
  });

  test( 'name: no label', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'wof:name': 'B'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].name, 'B');
      t.end();
    });
  });
};

module.exports.store_abbr = function(test, util) {

  test( 'abbr: no abbr', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].abbr, undefined);
      t.end();
    });
  });

  test( 'abbr: calls function', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'wof:placetype': 'country',
      'wof:country_alpha3': 'TEST',
      'wof:abbreviation': 'TEST2'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].abbr, 'TEST');
      t.end();
    });
  });
};

module.exports.store_placetype = function(test, util) {

  test( 'placetype: no placetype', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].placetype, undefined);
      t.end();
    });
  });

  test( 'placetype: exists', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'wof:placetype': 'AA'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].placetype, 'AA');
      t.end();
    });
  });
};

module.exports.store_population = function(test, util) {

  test( 'population: no population', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].population, undefined);
      t.end();
    });
  });

  test( 'population: calls function', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'mz:population': 999
    }, function(){
      t.deepEqual( mock._calls.set[0][1].population, 999);
      t.end();
    });
  });
};

module.exports.store_lineage = function(test, util) {

  test( 'lineage: no lineage', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].lineage, undefined);
      t.end();
    });
  });

  test( 'lineage: calls function', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'wof:hierarchy': { a: 'b', c: 'd' }
    }, function(){
      t.deepEqual( mock._calls.set[0][1].lineage, { a: 'b', c: 'd' });
      t.end();
    });
  });
};

module.exports.store_geom = function(test, util) {

  test( 'geom: no area', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.area, undefined);
      t.end();
    });
  });

  test( 'geom: area defined', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'geom:area': 999
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.area, 999);
      t.end();
    });
  });

  test( 'geom: no bbox', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.bbox, undefined);
      t.end();
    });
  });

  test( 'geom: bbox prefer label', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'lbl:bbox': 'ABC',
      'geom:bbox': 'DEF'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.bbox, 'ABC');
      t.end();
    });
  });

  test( 'geom: bbox no label', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'geom:bbox': 'DEF'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.bbox, 'DEF');
      t.end();
    });
  });

  test( 'geom: no lat', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.lat, undefined);
      t.end();
    });
  });

  test( 'geom: lat prefer label', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'lbl:latitude': 1,
      'geom:latitude': 2
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.lat, 1);
      t.end();
    });
  });

  test( 'geom: lat no label', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'geom:latitude': 2
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.lat, 2);
      t.end();
    });
  });

  test( 'geom: no lon', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1'
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.lon, undefined);
      t.end();
    });
  });

  test( 'geom: lon prefer label', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'lbl:longitude': 1,
      'geom:longitude': 2
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.lon, 1);
      t.end();
    });
  });

  test( 'geom: lon no label', function(t) {
    var mock = new Mock();
    mock.insertWofRecord({
      'wof:id': '1',
      'geom:longitude': 2
    }, function(){
      t.deepEqual( mock._calls.set[0][1].geom.lon, 2);
      t.end();
    });
  });
};

module.exports.getAbbreviation = function(test, util) {

  test( 'no abbreviation', function(t) {
    t.equal( undefined, wof.getAbbreviation({}) );
    t.end();
  });

  test( 'country/dependency', function(t) {
    t.equal( undefined, wof.getAbbreviation({ 'wof:placetype': 'country' }) );
    t.equal( undefined, wof.getAbbreviation({ 'wof:placetype': 'dependency' }) );
    t.equal( undefined, wof.getAbbreviation({
      'wof:placetype': 'country',
      'wof:abbreviation': 'TEST2'
    }));
    t.equal( undefined, wof.getAbbreviation({
      'wof:placetype': 'dependency',
      'wof:abbreviation': 'TEST2'
    }));
    t.equal( 'TEST', wof.getAbbreviation({
      'wof:placetype': 'country',
      'wof:country_alpha3': 'TEST',
      'wof:abbreviation': 'TEST2'
    }));
    t.equal( 'TEST', wof.getAbbreviation({
      'wof:placetype': 'dependency',
      'wof:country_alpha3': 'TEST',
      'wof:abbreviation': 'TEST2'
    }));
    t.end();
  });

  test( 'wof:abbreviation', function(t) {
    t.equal( 'TEST2', wof.getAbbreviation({
      'wof:country_alpha3': 'TEST',
      'wof:abbreviation': 'TEST2'
    }));
    t.equal( 'TEST2', wof.getAbbreviation({
      'wof:country_alpha3': 'TEST',
      'wof:abbreviation': 'TEST2'
    }));
    t.end();
  });
};

module.exports.getPopulation = function(test, util) {

  test( 'no population', function(t) {
    t.equal( undefined, wof.getPopulation({}) );
    t.end();
  });

  var props = [ 'ne:pop_est', 'statoids:population', 'meso:pop', 'zs:pop10', 'qs:gn_pop', 'qs:pop',
                'gn:pop', 'gn:population', 'wk:population', 'wof:population', 'mz:population' ];

  test( 'population priority', function(t) {
    props.forEach( function( prop, x ){

      // build a properties object containing
      // progessively more of the target props
      var p = {};
      for( var y=0; y<=x; y++ ){ p[ prop ] = y+1; }

      t.equal( x+1, wof.getPopulation( p ) );
    });
    t.end();
  });

};

module.exports.isValidWofRecord = function(test, util) {

  test( 'valid id', function(t) {
    t.true( wof.isValidWofRecord( 1, {} ) );
    t.true( wof.isValidWofRecord( 999999, {} ) );
    t.end();
  });

  test( 'invalid id', function(t) {
    t.false( wof.isValidWofRecord( -1, {} ) );
    t.false( wof.isValidWofRecord( 0, {} ) );
    t.false( wof.isValidWofRecord( null, {} ) );
    t.end();
  });

  test( 'deprecated', function(t) {
    t.false( wof.isValidWofRecord( 1, { 'edtf:deprecated': 'any value' } ) );
    t.end();
  });

  test( 'not deprecated', function(t) {
    t.true( wof.isValidWofRecord( 1, { 'edtf:deprecated': '' } ) );
    t.true( wof.isValidWofRecord( 1, { 'edtf:deprecated': 'uuuu' } ) );
    t.end();
  });

  test( 'superseded', function(t) {
    t.false( wof.isValidWofRecord( 1, { 'wof:superseded_by': [ 'any value' ] } ) );
    t.end();
  });

  test( 'not superseded', function(t) {
    t.true( wof.isValidWofRecord( 1, { 'wof:superseded_by': [] } ) );
    t.true( wof.isValidWofRecord( 1, { 'wof:superseded_by': 'scalar' } ) );
    t.end();
  });

  test( 'not current', function(t) {
    t.false( wof.isValidWofRecord( 1, { 'mz:is_current': 0 } ) );
    t.false( wof.isValidWofRecord( 1, { 'mz:is_current': '0' } ) );
    t.end();
  });

  test( 'current', function(t) {
    t.true( wof.isValidWofRecord( 1, { 'mz:is_current': 1 } ) );
    t.true( wof.isValidWofRecord( 1, { 'mz:is_current': '1' } ) );
    t.true( wof.isValidWofRecord( 1, { 'mz:is_current': '' } ) );
    t.end();
  });

  test( 'default', function(t) {
    t.true( wof.isValidWofRecord( 1, {} ) );
    t.end();
  });
};
