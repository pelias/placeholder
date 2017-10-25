
var Database = require('../../lib/Database');

module.exports.constructor = function(test, common) {
  test('constructor', function(t) {
    var db = new Database();
    t.equal( typeof db.open, 'function' );
    t.equal( typeof db.close, 'function' );
    t.equal( typeof db.prepare, 'function' );
    t.equal( typeof db.configure, 'function' );
    t.equal( typeof db.reset, 'function' );
    t.equal( typeof db.populate, 'function' );
    t.equal( typeof db.optimize, 'function' );
    t.end();
  });
};

module.exports.open = function(test, common) {
  test('open', function(t) {
    var db = new Database();
    t.false( db.db );

    // ensure 'reset' is not run
    db.reset = t.end;

    // ensure 'optimize' is not run
    db.optimize = t.end;

    // open connection
    db.open('/tmp/db', { memory: true });
    t.equal( db.db.constructor.name, 'Database' );
    t.deepEqual( db.db, {
      inTransaction: false,
      open: true,
      memory: true,
      readonly: false,
      name: '/tmp/db'
    });

    t.end();
  });

  test('open - runs configure', function(t) {
    var db = new Database();

    // ensure 'configure' is run
    db.configure = t.end;

    // open connection
    db.open('/tmp/db', { memory: true });
  });

  test('open - runs reset', function(t) {
    var db = new Database();

    // ensure 'reset' is run
    db.reset = t.end;

    // open connection
    db.open('/tmp/db', { memory: true, reset: true });
  });

  test('open - runs optimize', function(t) {
    var db = new Database();

    // ensure 'optimize' is run
    db.optimize = t.end;

    // open connection
    db.open('/tmp/db', { memory: true, reset: true });
  });
};

module.exports.close = function(test, common) {
  test('close', function(t) {
    var db = new Database();
    db.open('/tmp/db', { memory: true });
    t.true( db.db.open );
    db.close();
    t.false( db.db.open );
    t.end();
  });
};

module.exports.prepare = function(test, common) {
  test('prepare', function(t) {
    var db = new Database();
    db.open('/tmp/db', { memory: true });
    
    t.equal(typeof db.stmt, 'undefined');
    
    const sql = 'SELECT * FROM sqlite_master';
    db.prepare(sql);
    
    t.true(typeof db.stmt, 'object');
    t.true(db.stmt.hasOwnProperty(sql));
    t.deepEqual(db.stmt[sql], {
      returnsData: true,
      source: 'SELECT * FROM sqlite_master',
      database: db.db
    });
    
    t.end();
  });
};

module.exports.configure = function(test, common) {
  test('configure', function(t) {
    var db = new Database();
    db.open('/tmp/db', { memory: true });

    // configure
    const pragma_checks = [
      { foreign_keys: 0 },
      { page_size: 4096 },
      { cache_size: -2000 },
      { synchronous: 0 },
      // { journal_mode: 0 },
      { temp_store: 2 }
    ];

    t.plan( pragma_checks.length );
    pragma_checks.forEach( pragma => {
      var sql = 'PRAGMA ' + Object.keys(pragma)[0] + ';';
      t.deepEqual( db.db.prepare(sql).get(), pragma );
    });
  });
};
