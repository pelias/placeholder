
var TokenIndex = require('../../lib/TokenIndex');

module.exports.constructor = function(test, common) {
  test('constructor', function(t) {
    var db = new TokenIndex();
    t.equal( db.constructor.super_.name, 'Database' );
    t.equal( typeof db.reset, 'function' );
    t.equal( typeof db.populate, 'function' );

    t.equal( typeof db.setLineage, 'function' );
    t.equal( typeof db.setTokens, 'function' );
    t.end();
  });
};

module.exports.reset = function(test, common) {
  test('reset', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });

    // ensure table has been created
    var sql = 'PRAGMA table_info(lineage)';
    t.deepEqual( db.prepare(sql).all(), [
      { cid: 0, name: 'id', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 1, name: 'pid', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 }
    ]);

    // ensure table has been created
    sql = 'PRAGMA table_info(tokens)';
    t.deepEqual( db.prepare(sql).all(), [
      { cid: 0, name: 'id', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 1, name: 'layer', type: 'STRING', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 2, name: 'lang', type: 'STRING', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 3, name: 'tag', type: 'STRING', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 4, name: 'token', type: 'STRING', notnull: 0, dflt_value: null, pk: 0 }
    ]);

    // ensure table has been created
    sql = 'PRAGMA table_info(fulltext)';
    t.deepEqual( db.prepare(sql).all(), [
      { cid: 0, name: 'token', type: '', notnull: 0, dflt_value: null, pk: 0 }
    ]);

    // ensure fts table has been created with the correct options
    sql = 'select * from sqlite_master where type="table" and name="fulltext"';
    const expected =
      'CREATE VIRTUAL TABLE fulltext USING fts5( token, ' + [
      `tokenize="unicode61 remove_diacritics 0 tokenchars '_'"`,
      `prefix='1 2 3 4 5 6 7 8 9 10 11 12'`,
      'columnsize=0'
    ].join(', ') + ')';

    t.deepEqual( db.prepare(sql).get().sql, expected );
    t.end();
  });
};

module.exports.checkSchema = function(test, common) {
  test('checkSchema - empty', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true });
    t.throws(() => { db.checkSchema(); }, /schema invalid: table lineage/);
    t.end();
  });
  test('checkSchema - valid', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });
    t.doesNotThrow(() => { db.checkSchema(); });
    t.end();
  });
  test('checkSchema - invalid lineage', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });
    db.db.exec('DROP TABLE IF EXISTS lineage');
    t.throws(() => { db.checkSchema(); }, /schema invalid: table lineage/);
    t.end();
  });
  test('checkSchema - invalid tokens', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });
    db.db.exec('DROP TABLE IF EXISTS tokens');
    t.throws(() => { db.checkSchema(); }, /schema invalid: table tokens/);
    t.end();
  });
  test('checkSchema - invalid fulltext', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });
    db.db.exec('DROP TABLE IF EXISTS fulltext');
    t.throws(() => { db.checkSchema(); }, /schema invalid: table fulltext/);
    t.end();
  });
};

module.exports.populate = function(test, common) {
  test('populate', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });

    // prepare some sql statments
    const fulltext = {
      query: db.prepare('SELECT * FROM fulltext')
    };
    const tokens = {
      insert: db.prepare('INSERT INTO tokens ( id, lang, tag, token ) VALUES ( $id, $lang, $tag, $token )')
    };

    // add some rows to the tokens table
    tokens.insert.run({ id: 1, lang: 'en', tag: 'test', token: 'hello world' });
    tokens.insert.run({ id: 2, lang: 'fr', tag: 'test', token: 'a b c' });

    // no rows in fulltext table
    t.deepEqual( fulltext.query.all(), [] );

    // run populate
    db.populate();

    // no rows in fulltext table
    t.deepEqual( fulltext.query.all(), [
      { token: 'hello_world' },
      { token: 'a_b_c' }
    ]);

    t.end();
  });
};

module.exports.setLineage = function(test, common) {
  test('setLineage', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });

    t.plan(1);

    const id = 100;
    const pids = [ 200, 300 ];

    db.setLineage( id, pids, (err) => {

      // ensure rows have been created
      const sql = 'SELECT * FROM lineage';
      t.deepEqual( db.prepare(sql).all(), [
        { id: 100, pid: 200 },
        { id: 100, pid: 300 }
      ]);

    });
  });
  test('setLineage - empty pids array', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });

    t.plan(1);

    db.setLineage( 1, [], (err, res) => {
      t.deepEqual( db.prepare('SELECT * FROM lineage').all(), []);
    });
  });
};

module.exports.setTokens = function(test, common) {
  test('setTokens', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });

    t.plan(1);

    const id = 100;
    const tokens = [
      { lang: 'en', tag: 'abbr', body: 'test1' },
      { lang: 'fr', tag: 'variant', body: 'test2' }
    ];

    db.setTokens( id, tokens, (err) => {

      // ensure rows have been created
      const sql = 'SELECT * FROM tokens';
      t.deepEqual( db.prepare(sql).all(), [
        { id: 100, layer: null, lang: 'en', tag: 'abbr', token: 'test1' },
        { id: 100, layer: null, lang: 'fr', tag: 'variant', token: 'test2' }
      ]);

    });
  });
  test('setTokens - empty tokens array', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { test: true, reset: true });

    t.plan(1);

    db.setTokens( 1, [], (err, res) => {
      t.deepEqual( db.prepare('SELECT * FROM tokens').all(), []);
    });
  });
};
