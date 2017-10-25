
var TokenIndex = require('../../lib/TokenIndex');

module.exports.constructor = function(test, common) {
  test('constructor', function(t) {
    var db = new TokenIndex();
    t.equal( typeof db._queryBool, 'function' );
    t.equal( typeof db._queryAll, 'function' );
    t.equal( typeof db.hasSubject, 'function' );
    t.equal( typeof db.hasSubjectAutocomplete, 'function' );
    t.equal( typeof db.matchSubjectDistinctSubjectIds, 'function' );
    t.equal( typeof db.matchSubjectAutocompleteDistinctSubjectIds, 'function' );
    t.equal( typeof db.matchSubjectObject, 'function' );
    t.equal( typeof db.matchSubjectObjectAutocomplete, 'function' );
    t.end();
  });
};

module.exports.hasSubject = function(test, common) {
  test('hasSubject', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { memory: true, reset: true });

    // prepare some sql statments
    const tokens = {
      insert: db.prepare('INSERT INTO tokens ( id, lang, tag, token ) VALUES ( $id, $lang, $tag, $token )')
    };

    // add some rows to the tokens table
    tokens.insert.run({ id: 1, lang: 'en', tag: 'test', token: 'hello world' });
    tokens.insert.run({ id: 2, lang: 'fr', tag: 'test', token: 'a b c' });

    // run populate
    db.populate();

    t.plan(7);
    db.hasSubject('hel', t.false );
    db.hasSubject('hello', t.false );
    db.hasSubject('hello wor', t.false );
    db.hasSubject('hello world', t.true );
    db.hasSubject('a', t.false );
    db.hasSubject('a b', t.false );
    db.hasSubject('a b c', t.true );
  });
};

module.exports.hasSubjectAutocomplete = function(test, common) {
  test('hasSubjectAutocomplete', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { memory: true, reset: true });

    // prepare some sql statments
    const tokens = {
      insert: db.prepare('INSERT INTO tokens ( id, lang, tag, token ) VALUES ( $id, $lang, $tag, $token )')
    };

    // add some rows to the tokens table
    tokens.insert.run({ id: 1, lang: '', tag: '', token: 'hello world' });
    tokens.insert.run({ id: 2, lang: '', tag: '', token: 'a b c' });

    // run populate
    db.populate();

    t.plan(7);
    db.hasSubjectAutocomplete('hel', t.false );
    db.hasSubjectAutocomplete('hello', t.false );
    db.hasSubjectAutocomplete('hello wor', t.false );
    db.hasSubjectAutocomplete('hello world', t.true );
    db.hasSubjectAutocomplete('a', t.false );
    db.hasSubjectAutocomplete('a b', t.false );
    db.hasSubjectAutocomplete('a b c', t.true );
  });
};

module.exports.matchSubjectDistinctSubjectIds = function(test, common) {
  test('matchSubjectDistinctSubjectIds', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { memory: true, reset: true });

    // prepare some sql statments
    const tokens = {
      insert: db.prepare('INSERT INTO tokens ( id, lang, tag, token ) VALUES ( $id, $lang, $tag, $token )')
    };

    // add some rows to the tokens table
    tokens.insert.run({ id: 1, lang: '', tag: '', token: 'hello world' });
    tokens.insert.run({ id: 2, lang: '', tag: '', token: 'a b c' });
    tokens.insert.run({ id: 3, lang: '', tag: '', token: 'hello world' });

    // run populate
    db.populate();

    // generic failure test
    const fail = (err, ids) => {
      t.false(err);
      t.deepEquals(ids, []);
    };

    t.plan(14);
    db.matchSubjectDistinctSubjectIds('hel', fail);
    db.matchSubjectDistinctSubjectIds('hello', fail);
    db.matchSubjectDistinctSubjectIds('hello wor', fail);
    db.matchSubjectDistinctSubjectIds('hello world', (err, ids) => {
      t.false(err);
      t.deepEquals(ids, [
        { subjectId: 1 },
        { subjectId: 3 }
      ]);
    });
    db.matchSubjectDistinctSubjectIds('a', fail);
    db.matchSubjectDistinctSubjectIds('a b', fail);
    db.matchSubjectDistinctSubjectIds('a b c', (err, ids) => {
      t.false(err);
      t.deepEquals(ids, [
        { subjectId: 2 }
      ]);
    });
  });
};

module.exports.matchSubjectAutocompleteDistinctSubjectIds = function(test, common) {
  test('matchSubjectAutocompleteDistinctSubjectIds', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { memory: true, reset: true });

    // prepare some sql statments
    const tokens = {
      insert: db.prepare('INSERT INTO tokens ( id, lang, tag, token ) VALUES ( $id, $lang, $tag, $token )')
    };

    // add some rows to the tokens table
    tokens.insert.run({ id: 1, lang: '', tag: '', token: 'hello world' });
    tokens.insert.run({ id: 2, lang: '', tag: '', token: 'a b c' });
    tokens.insert.run({ id: 3, lang: '', tag: '', token: 'hello world' });

    // run populate
    db.populate();

    // generic failure test
    const fail = (err, ids) => {
      t.false(err);
      t.deepEquals(ids, []);
    };

    t.plan(14);
    db.matchSubjectAutocompleteDistinctSubjectIds('hel', fail);
    db.matchSubjectAutocompleteDistinctSubjectIds('hello', fail);
    db.matchSubjectAutocompleteDistinctSubjectIds('hello wor', fail);
    db.matchSubjectAutocompleteDistinctSubjectIds('hello world', (err, ids) => {
      t.false(err);
      t.deepEquals(ids, [
        { subjectId: 1 },
        { subjectId: 3 }
      ]);
    });
    db.matchSubjectAutocompleteDistinctSubjectIds('a', fail);
    db.matchSubjectAutocompleteDistinctSubjectIds('a b', fail);
    db.matchSubjectAutocompleteDistinctSubjectIds('a b c', (err, ids) => {
      t.false(err);
      t.deepEquals(ids, [
        { subjectId: 2 }
      ]);
    });
  });
};

module.exports.matchSubjectObject = function(test, common) {
  test('matchSubjectObject', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { memory: true, reset: true });

    // prepare some sql statments
    const tokens = {
      insert: db.prepare('INSERT INTO tokens ( id, lang, tag, token ) VALUES ( $id, $lang, $tag, $token )')
    };
    const lineage = {
      insert: db.prepare('INSERT INTO lineage ( id, pid ) VALUES ( $id, $pid )')
    };

    // add some rows to the tokens table
    tokens.insert.run({ id: 1, lang: '', tag: '', token: 'paris' });
    tokens.insert.run({ id: 2, lang: '', tag: '', token: 'paris' });
    tokens.insert.run({ id: 3, lang: '', tag: '', token: 'france' });
    tokens.insert.run({ id: 4, lang: '', tag: '', token: 'texas' });

    // add some rows to the lineage table
    lineage.insert.run({ id: 1, pid: 3 });
    lineage.insert.run({ id: 2, pid: 4 });

    // run populate
    db.populate();

    // generic failure test
    const fail = (err, ids) => {
      t.false(err);
      t.deepEquals(ids, []);
    };

    t.plan(10);
    db.matchSubjectObject('paris', 'paris', fail);
    db.matchSubjectObject('france', 'france', fail);
    db.matchSubjectObject('texas', 'texas', fail);

    db.matchSubjectObject('paris', 'france', (err, ids) => {
      t.false(err);
      t.deepEquals(ids, [
        { subjectId: 1, objectId: 3 }
      ]);
    });

    db.matchSubjectObject('paris', 'texas', (err, ids) => {
      t.false(err);
      t.deepEquals(ids, [
        { subjectId: 2, objectId: 4 }
      ]);
    });
  });
};

module.exports.matchSubjectObjectAutocomplete = function(test, common) {
  test('matchSubjectObjectAutocomplete', function(t) {
    var db = new TokenIndex();
    db.open('/tmp/db', { memory: true, reset: true });

    // prepare some sql statments
    const tokens = {
      insert: db.prepare('INSERT INTO tokens ( id, lang, tag, token ) VALUES ( $id, $lang, $tag, $token )')
    };
    const lineage = {
      insert: db.prepare('INSERT INTO lineage ( id, pid ) VALUES ( $id, $pid )')
    };

    // add some rows to the tokens table
    tokens.insert.run({ id: 1, lang: '', tag: '', token: 'paris' });
    tokens.insert.run({ id: 2, lang: '', tag: '', token: 'paris' });
    tokens.insert.run({ id: 3, lang: '', tag: '', token: 'france' });
    tokens.insert.run({ id: 4, lang: '', tag: '', token: 'texas' });

    // add some rows to the lineage table
    lineage.insert.run({ id: 1, pid: 3 });
    lineage.insert.run({ id: 2, pid: 4 });

    // run populate
    db.populate();

    // generic failure test
    const fail = (err, ids) => {
      t.false(err);
      t.deepEquals(ids, []);
    };

    t.plan(10);
    db.matchSubjectObjectAutocomplete('paris', 'paris', fail);
    db.matchSubjectObjectAutocomplete('france', 'france', fail);
    db.matchSubjectObjectAutocomplete('texas', 'texas', fail);

    db.matchSubjectObjectAutocomplete('paris', 'france', (err, ids) => {
      t.false(err);
      t.deepEquals(ids, [
        { subjectId: 1, objectId: 3 }
      ]);
    });

    db.matchSubjectObjectAutocomplete('paris', 'texas', (err, ids) => {
      t.false(err);
      t.deepEquals(ids, [
        { subjectId: 2, objectId: 4 }
      ]);
    });
  });
};
