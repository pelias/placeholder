const query = require('../../prototype/query');

module.exports.exports = function(test, common) {
  test('exports', function(t) {
    t.equal( typeof query.query, 'function' );
    t.equal( typeof query._queryGroup, 'function' );
    t.equal( typeof query._queryManyGroups, 'function' );
    t.end();
  });
};

module.exports._queryGroup = function(test, common) {
  test('_queryGroup - empty group', function(t) {

    const group = [];

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, []);
      t.deepEqual(_mask, []);
      t.equal(_group, group);
      t.end();
    };

    query._queryGroup(null, group, done);
  });
  test('_queryGroup - single token - no matches', function(t) {

    const group = ['hello world'];
    t.plan(5);

    const index = {
      matchSubjectDistinctSubjectIds: ( phrase, cb ) => {
        t.equals(phrase, 'hello world');
        return cb( null, [] );
      }
    };

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, []);
      t.deepEqual(_mask, []);
      t.equal(_group, group);
    };

    query._queryGroup(index, group, done);
  });
  test('_queryGroup - single token - with matches', function(t) {

    const group = ['hello world'];
    t.plan(5);

    const index = {
      matchSubjectDistinctSubjectIds: ( phrase, cb ) => {
        t.equals(phrase, 'hello world');
        return cb( null, [
          { subjectId: 100 },
          { subjectId: 200 },
          { subjectId: 300 },
        ]);
      }
    };

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, [ 100, 200, 300 ]);
      t.deepEqual(_mask, []);
      t.equal(_group, group);
    };

    query._queryGroup(index, group, done);
  });
  test('_queryGroup - multiple tokens - no matches', function(t) {

    const group = ['hello world', 'test', 'foo bar'];
    t.plan(7);

    const index = {
      matchSubjectObject: ( subject, object, cb ) => {
        t.ok(true);
        return cb( null, [] );
      },
      matchSubjectDistinctSubjectIds: ( phrase, cb ) => {
        t.equals(phrase, 'foo bar');
        return cb( null, [
          { subjectId: 100 },
          { subjectId: 200 },
          { subjectId: 300 },
        ]);
      }
    };

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, [ 100, 200, 300 ]);
      t.deepEqual(_mask, [ true, true, false ]);
      t.equal(_group, group);
    };

    query._queryGroup(index, group, done);
  });
  test('_queryGroup - multiple tokens - matches', function(t) {

    const group = ['hello world', 'test', 'foo bar'];
    t.plan(6);

    const index = {
      matchSubjectObject: ( subject, object, cb ) => {
        t.ok(true);
        switch( subject ){
          case 'hello world':
            return cb( null, [
              { subjectId: 100, objectId: 300 },
              { subjectId: 200, objectId: 410 },
            ]);
          case 'test':
            return cb( null, [
              { subjectId: 300, objectId: 800 },
              { subjectId: 400, objectId: 900 },
            ]);
          default:
            return cb( null, [
              { subjectId: 800, objectId: 880 },
              { subjectId: 900, objectId: 990 },
            ]);
        }
      }
    };

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, [ 100 ]);
      t.deepEqual(_mask, [ true, true, true ]);
      t.equal(_group, group);
    };

    query._queryGroup(index, group, done);
  });
};

module.exports._queryManyGroups = function(test, common) {
  test('_queryManyGroups - empty groups', function(t) {

    const groups = [];

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, []);
      t.deepEqual(_mask, []);
      t.deepEqual(_group, []);
      t.end();
    };

    query._queryManyGroups(null, groups, done);
  });
  test('_queryManyGroups - single group', function(t) {

    t.plan(5);
    const groups = [
      ['hello world'],
    ];

    const index = {
      matchSubjectDistinctSubjectIds: ( phrase, cb ) => {
        t.equals(phrase, 'hello world');
        return cb( null, [
          { subjectId: 100 },
          { subjectId: 200 },
          { subjectId: 300 },
        ]);
      }
    };

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, [ 100, 200, 300 ]);
      t.deepEqual(_mask, []);
      t.equal(_group, groups[0]);
    };

    query._queryManyGroups(index, groups, done);
  });
  test('_queryManyGroups - multiple groups', function(t) {

    t.plan(6);
    const groups = [
      ['hello world'],
      ['hallo welt'],
    ];

    const index = {
      matchSubjectDistinctSubjectIds: ( phrase, cb ) => {
        t.ok(true);
        switch( phrase ){
          case 'hello world':
            return cb( null, [
              { subjectId: 100, objectId: 300 },
              { subjectId: 200, objectId: 410 },
            ]);
          case 'hallo welt':
            return cb( null, [
              { subjectId: 300, objectId: 800 },
              { subjectId: 400, objectId: 900 },
            ]);
          default:
            return cb( null, [
              { subjectId: 800, objectId: 880 },
              { subjectId: 900, objectId: 990 },
            ]);
        }
      }
    };

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, [ 100, 200, 300, 400 ]);
      t.deepEqual(_mask, []);
      t.equal(_group, groups[0]);
    };

    query._queryManyGroups(index, groups, done);
  });
};

module.exports.query = function(test, common) {
  test('query - empty text', function(t) {

    const text = '';
    const mock = {
      tokenize: ( t, cb ) => {
        cb( null, [] );
      }
    };

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, []);
      t.deepEqual(_mask, []);
      t.deepEqual(_group, []);
      t.end();
    };

    query.query.call(mock, text, done);
  });
  test('query - single group', function(t) {

    t.plan(5);
    const text = 'hello world';
    const mock = {
      tokenize: ( t, cb ) => {
        cb( null, [['hello world']] );
      },
      index: {
        matchSubjectDistinctSubjectIds: ( phrase, cb ) => {
          t.equals(phrase, 'hello world');
          return cb( null, [
            { subjectId: 100 },
            { subjectId: 200 },
            { subjectId: 300 },
          ]);
        }
      }
    };

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, [ 100, 200, 300 ]);
      t.deepEqual(_mask, []);
      t.deepEqual(_group, [ 'hello world' ]);
    };

    query.query.call(mock, text, done);
  });
  test('query - multiple groups', function(t) {

    t.plan(6);
    const text = 'hello world';
    const mock = {
      tokenize: ( t, cb ) => {
        cb( null, [['hello world'], ['hallo welt']] );
      },
      index: {
        matchSubjectDistinctSubjectIds: ( phrase, cb ) => {
          t.ok(true);
          return cb( null, [
            { subjectId: 100 },
            { subjectId: 200 },
            { subjectId: 300 },
          ]);
        }
      }
    };

    const done = ( _err, _ids, _mask, _group ) => {
      t.deepEqual(_err, null);
      t.deepEqual(_ids, [ 100, 200, 300 ]);
      t.deepEqual(_mask, []);
      t.deepEqual(_group, [ 'hello world' ]);
    };

    query.query.call(mock, text, done);
  });
};
