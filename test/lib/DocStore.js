
var DocStore = require('../../lib/DocStore');

module.exports.constructor = function(test, common) {
  test('constructor', function(t) {
    var db = new DocStore();
    t.equal( db.constructor.super_.name, 'Database' );
    t.equal( typeof db.reset, 'function' );
    t.equal( typeof db.set, 'function' );
    t.equal( typeof db.get, 'function' );
    t.equal( typeof db.getMany, 'function' );
    t.end();
  });
};

module.exports.reset = function(test, common) {
  test('reset', function(t) {
    var db = new DocStore();
    db.open('/tmp/db', { test: true, reset: true });
    
    // ensure table has been created
    const sql = 'PRAGMA table_info(docs)';
    t.deepEqual( db.prepare(sql).all(), [
      { cid: 0, name: 'id', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 1 },
      { cid: 1, name: 'json', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 }
    ]);
    
    t.end();
  });
};

module.exports.checkSchema = function(test, common) {
  test('checkSchema - empty', function(t) {
    var db = new DocStore();
    db.open('/tmp/db', { test: true });
    t.throws(() => { db.checkSchema(); }, /schema invalid: table docs/);
    t.end();
  });
  test('checkSchema - valid', function(t) {
    var db = new DocStore();
    db.open('/tmp/db', { test: true, reset: true });
    t.doesNotThrow(() => { db.checkSchema(); });
    t.end();
  });
  test('checkSchema - invalid', function(t) {
    var db = new DocStore();
    db.open('/tmp/db', { test: true });
    db.db.exec('DROP TABLE IF EXISTS docs');
    db.db.exec('CREATE TABLE docs( id INTEGER PRIMARY KEY, foo TEXT )');
    t.throws(() => { db.checkSchema(); });
    t.end();
  });
};

module.exports.set = function(test, common) {
  test('set', function(t) {
    var db = new DocStore();
    db.open('/tmp/db', { test: true, reset: true });

    t.plan(1);

    const id = 100;
    const data = { test: { foo: 'bar' } };

    db.set( id, data, (err) => {

      // ensure row has been created
      const sql = 'SELECT * FROM docs WHERE id = ? LIMIT 1';
      t.deepEqual( db.prepare(sql).all(id), [
        { id: id, json: DocStore.codec.encode( data ) }
      ]);

    });
  });
};

module.exports.get = function(test, common) {
  test('get', function(t) {
    var db = new DocStore();
    db.open('/tmp/db', { test: true, reset: true });

    t.plan(1);

    const id = 100;
    const data = { test: { foo: 'bar' } };

    // insert a row in the database
    db.prepare('INSERT INTO docs (id, json) VALUES ($id, $json)')
      .run({ id: id, json: DocStore.codec.encode( data ) });

      // retrieve row
    db.get( id, (err, res) => {
      t.deepEqual( res, data );
    });
  });
};

module.exports.getMany = function(test, common) {
  test('getMany', function(t) {
    var db = new DocStore();
    db.open('/tmp/db', { test: true, reset: true });

    t.plan(1);

    // insert a row in the database
    var stmt = db.prepare('INSERT INTO docs (id, json) VALUES ($id, $json)');
    stmt.run({ id: 100, json: DocStore.codec.encode({ test: 100 }) });
    stmt.run({ id: 200, json: DocStore.codec.encode({ test: 200 }) });
    stmt.run({ id: 300, json: DocStore.codec.encode({ test: 300 }) });

      // retrieve rows
    db.getMany( [100, 300], (err, res) => {
      t.deepEqual( res, [
        { test: 100 },
        { test: 300 }
      ]);
    });
  });
  test('getMany - empty ids array', function(t) {
    var db = new DocStore();
    db.open('/tmp/db', { test: true, reset: true });

    t.plan(1);

    // retrieve rows
    db.getMany( [], (err, res) => {
      t.deepEqual( res, [] );
    });
  });
};
