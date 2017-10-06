
var through = require('through2'),
    split = require('split2'),
    fs = require('fs'),
    tty = require('tty');

var encoding = require('../wip/encoding');
var Database = require('../wip/Database');
var LevelBatch = require('level-batch-stream');
var BatchStream = require('batch-stream');

var tap = ( process.argv.length >= 3 && 'string' === typeof process.argv[2] ) ?
  fs.createReadStream( process.argv[2] ) :
  process.stdin;

if( tap === process.stdin && tty.isatty( process.stdin ) ){
  console.error('no data piped to stdin');
  process.exit(1);
}

var db = new Database('./db');

tap.pipe( split() )
   .pipe( through.obj(( chunk, enc, next ) => {
      var cols = chunk.toString('utf8').split('|');
      next( null, {
        type: 'put',
        key: encoding.codec.state.encode({
          id: parseInt( cols[0], 10 ),
          subject: cols[1],
          object: cols[2]
        }),
        value: undefined
      });
    }))
    .pipe( new BatchStream({ size: 1000, highWaterMark: 10 }) )
    .pipe( new LevelBatch( db.db ) );
