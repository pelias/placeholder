const Result = require('../../lib/Result');

module.exports.constructor = function(test, common) {
  test('constructor', function(t) {
    var res = new Result();
    
    t.equal( typeof res.getSubject, 'function' );
    t.equal( typeof res.getObject, 'function' );
    t.equal( typeof res.getPreviousObject, 'function' );
    t.equal( typeof res.getIdsAsArray, 'function' );
    t.equal( typeof res.intersect, 'function' );

    t.deepEqual( res.group, [] );
    t.deepEqual( res.ids, {} );
    t.deepEqual( res.mask, [] );
    t.deepEqual( res.pos, { subject: -2, object: -1 });
    t.deepEqual( res.reset, false );
    t.equal( typeof res.done, 'function' );

    t.end();
  });
};

module.exports.getSubject = function(test, common) {
  test('getSubject', function(t) {
    var res = new Result();
    t.equal(res.getSubject(), undefined);

    var res2 = new Result(['a','b','c']);
    t.equal(res2.getSubject(), 'b');

    var res3 = new Result(['a','b','c']);
    res3.pos.subject = 0;
    t.equal(res3.getSubject(), 'a');

    t.end();
  });
};

module.exports.getObject = function(test, common) {
  test('getObject', function(t) {
    var res = new Result();
    t.equal(res.getObject(), undefined);

    var res2 = new Result(['a','b','c']);
    t.equal(res2.getObject(), 'c');

    var res3 = new Result(['a','b','c']);
    res3.pos.object = 1;
    t.equal(res3.getObject(), 'b');

    t.end();
  });
};

module.exports.getPreviousObject = function(test, common) {
  test('getPreviousObject', function(t) {
    var res = new Result();
    t.equal(res.getPreviousObject(), undefined);

    var res2 = new Result(['a','b','c']);
    t.equal(res2.getPreviousObject(), undefined);

    var res3 = new Result(['a','b','c']);
    res3.pos.prev_object = 1;
    t.equal(res3.getPreviousObject(), 'b');

    t.end();
  });
};

module.exports.getIdsAsArray = function(test, common) {
  test('getIdsAsArray', function(t) {
    var res = new Result();
    t.deepEqual(res.getIdsAsArray(), []);

    var res2 = new Result();
    res2.ids = { '200': true, '201': true, '202': true };
    t.deepEqual(res2.getIdsAsArray(), [200, 201, 202]);

    t.end();
  });
};

module.exports.intersect = function(test, common) {
  test('intersect - error', function(t) {
    var res = new Result(['a','b','c','d','e']);
    t.deepEqual( res.pos, { subject: 3, object: 4 });
    res.intersect( 'an error' );
    t.deepEqual( res.pos, { subject: 2, object: 4 });
    t.end();
  });
  test('intersect - no results', function(t) {
    var res = new Result(['a','b','c','d','e']);
    t.deepEqual( res.pos, { subject: 3, object: 4 });
    res.intersect( null, [] );
    t.deepEqual( res.pos, { subject: 2, object: 4 });
    t.end();
  });
  test('intersect - match', function(t) {
    var res = new Result(['a','b','c','d','e']);
    t.deepEqual( res.pos, { subject: 3, object: 4 });
    res.intersect( null, [
      { subjectId: 102, objectId: 202 },
      { subjectId: 105, objectId: 205 },
      { subjectId: 100, objectId: 200 }
    ]);
    t.deepEqual( res.pos, { subject: 2, object: 3 });
    t.deepEqual( res.ids, { 100: true, 102: true, 105: true });
    t.end();
  });
  test('intersect - match parent', function(t) {
    var res = new Result(['a','b','c','d','e']);
    res.ids = { 200: true, 201: true, 202: true };
    t.deepEqual( res.pos, { subject: 3, object: 4 });
    res.intersect( null, [
      { subjectId: 102, objectId: 202 },
      { subjectId: 100, objectId: 200 },
      { subjectId: 105, objectId: 205 }
    ]);
    t.deepEqual( res.pos, { subject: 2, object: 3 });
    t.deepEqual( res.ids, { 100: true, 102: true });
    t.end();
  });
};
