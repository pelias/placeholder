
const through = require('through2');
const parser = require('../../lib/jsonParseStream');

module.exports.parse = function(test, common) {
  test('parse', function(t) {
    
    var chunks = [];

    const xform = (chunk, _, next) => {
      chunks.push( chunk );
      next();
    };

    const flush = (next) => {
      t.deepEqual(chunks, [
        { hello: 'world' },
        { test: 'message' }
      ]);
      t.end();
      next();
    };

    const stream = parser();
    stream.pipe( through.obj( xform, flush ) );
    stream.write('{ "hello": "world" }');
    stream.write('{ "test": "message" }');
    stream.end();
  });
};
