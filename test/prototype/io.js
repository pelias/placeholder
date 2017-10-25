
const path = require('path');
const io = require('../../prototype/io');

// Mock out placeholder
const MockPlaceholder = function(){
  this.store = {};
  this.index = {};
};
MockPlaceholder.prototype = io;

module.exports.exports = function(test, common) {
  test('exports', function(t) {
    t.equal( typeof io.load, 'function' );
    t.equal( typeof io.populate, 'function' );
    t.equal( typeof io.optimize, 'function' );
    t.equal( typeof io.close, 'function' );
    t.end();
  });
};

module.exports.load = function(test, common) {
  test('load', function(t) {

    const ph = new MockPlaceholder();
    const options = { foo: 'bar' };
    
    t.plan(4);

    const expectedFilename = path.join(__dirname, '../../data/store.sqlite3');

    // open store db
    ph.store.open = function( dbPath, opts ){
      t.equals(dbPath, expectedFilename);
      t.deepEqual(opts, options);
    };

    // open index db
    ph.index.open = function( dbPath, opts ){
      t.equals(dbPath, expectedFilename);
      t.deepEqual(opts, options);
    };

    ph.load(options);
  });
  test('load - using env var', function(t) {

    const ph = new MockPlaceholder();
    const options = { foo: 'bar' };
    
    t.plan(4);

    process.env.PLACEHOLDER_DATA = '/my_data_dir/';
    const expectedFilename = path.join(process.env.PLACEHOLDER_DATA, 'store.sqlite3');

    // open store db
    ph.store.open = function( dbPath, opts ){
      t.equals(dbPath, expectedFilename);
      t.deepEqual(opts, options);
    };

    // open index db
    ph.index.open = function( dbPath, opts ){
      t.equals(dbPath, expectedFilename);
      t.deepEqual(opts, options);
    };

    ph.load(options);

    delete process.env.PLACEHOLDER_DATA;
  });
};

module.exports.populate = function(test, common) {
  test('populate', function(t) {

    const ph = new MockPlaceholder();
    
    t.plan(2);

    // run 'populate' on both dbs
    ph.store.populate = t.false;
    ph.index.populate = t.false;

    ph.populate();
  });
};

module.exports.optimize = function(test, common) {
  test('optimize', function(t) {

    const ph = new MockPlaceholder();
    
    t.plan(1);

    // only run 'optimize' on one db
    ph.store.optimize = t.true;
    ph.index.optimize = t.false;

    ph.optimize();
  });
};

module.exports.close = function(test, common) {
  test('close', function(t) {

    const ph = new MockPlaceholder();
    
    t.plan(2);

    // run 'close' on both dbs
    ph.store.close = t.false;
    ph.index.close = t.false;

    ph.close();
  });
};
