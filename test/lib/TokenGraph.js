
var TokenGraph = require('../../lib/TokenGraph');

module.exports.constructor = function(test, common) {
  test('constructor', function(t) {
    var graph = new TokenGraph();
    t.deepEqual( graph.nodes, {} );
    t.deepEqual( graph.edges, {} );
    t.end();
  });
};

module.exports.hasToken = function(test, common) {
  test('hasToken', function(t) {
    var graph = new TokenGraph();
    t.false( graph.hasToken('test') );
    graph.nodes.test = true;
    t.true( graph.hasToken('test') );
    delete graph.nodes.test;
    t.false( graph.hasToken('test') );
    t.end();
  });
};

module.exports.getToken = function(test, common) {
  test('getToken', function(t) {
    var graph = new TokenGraph();
    t.false( graph.getToken('test') );
    graph.nodes.test = { a: 'b' };
    t.deepEqual( graph.getToken('test'), { a: 'b' } );
    delete graph.nodes.test;
    t.false( graph.getToken('test') );
    t.end();
  });
};

module.exports.addToken = function(test, common) {
  test('addToken', function(t) {
    var graph = new TokenGraph();
    graph.addToken(100, 'test');
    t.deepEqual( graph.nodes.test, [100] );
    graph.addToken(200, 'test');
    t.deepEqual( graph.nodes.test, [100, 200] );
    t.end();
  });
};

module.exports.setEdge = function(test, common) {
  test('setEdge', function(t) {
    var graph = new TokenGraph();
    graph.setEdge(100, 101);
    t.deepEqual( graph.edges['100'], [101] );
    graph.setEdge(100, 201);
    t.deepEqual( graph.edges['100'], [101, 201] );
    t.end();
  });
  test('setEdge - role', function(t) {
    var graph = new TokenGraph();
    graph.setEdge(100, 101, 'r');
    t.deepEqual( graph.edges['100:r'], [101] );
    graph.setEdge(100, 201, 'r');
    t.deepEqual( graph.edges['100:r'], [101, 201] );
    t.end();
  });
};

module.exports.sort = function(test, common) {
  test('sort', function(t) {
    var graph = new TokenGraph();

    graph.addToken(200, 'test');
    graph.addToken(200, 'test');
    graph.addToken(100, 'test');
    graph.setEdge(100, 201);
    graph.setEdge(100, 101);

    t.deepEqual( graph.nodes.test, [200, 200, 100] );
    t.deepEqual( graph.edges['100'], [201, 101] );

    graph.sort();

    t.deepEqual( graph.nodes.test, [100, 200] );
    t.deepEqual( graph.edges['100'], [101, 201] );

    t.end();
  });
};

module.exports.outEdges = function(test, common) {
  test('outEdges', function(t) {
    var graph = new TokenGraph();
    t.deepEqual( graph.outEdges(100), [] );
    graph.setEdge(100, 101);
    t.deepEqual( graph.outEdges(100), [101] );
    graph.setEdge(100, 201);
    t.deepEqual( graph.outEdges(100), [101, 201] );
    t.end();
  });
  test('outEdges - role', function(t) {
    var graph = new TokenGraph();
    t.deepEqual( graph.outEdges(100, 'r'), [] );
    graph.setEdge(100, 101, 'r');
    t.deepEqual( graph.outEdges(100, 'r'), [101] );
    graph.setEdge(100, 201, 'r');
    t.deepEqual( graph.outEdges(100, 'r'), [101, 201] );

    // different role
    t.deepEqual( graph.outEdges(100), [] );
    t.end();
  });
};
