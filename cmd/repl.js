
var repl = require('repl'),
    Placeholder = require('../Placeholder'),
    ph = new Placeholder();

// init placeholder
ph.load();

// commands
var commands = {
  search: function( input, cb ){
    console.time('took');
    var tokens = ph.tokenize( input );
    var results = ph.query( tokens ).ids;
    ph.store.getMany( results, function( err, docs ){
      if( err ){ return console.error( err ); }
      docs.forEach( function( doc ){
        console.log( ' -', [ doc.id, doc.placetype + ' ', doc.name ].join('\t') );
      });
      console.timeEnd('took');
      cb();
    });
  },
  tokenize: function( input, cb ){
    console.time('took');
    console.log( ph.tokenize( input ) );
    console.timeEnd('took');
    cb();
  },
  token: function( body, cb ){
    console.log( 'token', '"' + body + '"' );
    console.time('took');
    console.log( ph.graph.getToken( body ) );
    console.timeEnd('took');
    cb();
  },
  edges: function( id, cb ){
    console.log( 'edges', '"' + id + '"' );
    console.time('took');
    console.log( ph.graph.outEdges( id ) );
    console.timeEnd('took');
    cb();
  },
  id: function( id, cb ){
    console.time('took');
    ph.store.get( id, function( err, doc ){
      if( err ){ return console.error( err ); }
      // console.log( ' -', [ doc.id, doc.placetype + ' ', doc.name ].join('\t') );
      console.log( doc );
      console.timeEnd('took');
      cb();
    });
  }
};

function myEval(cmd, context, filename, cb) {
  var split = cmd.trim().split(/\s+/g);
  if( commands.hasOwnProperty( split[0] ) ){
    return commands[ split[0] ].call( null, split.splice(1).join(' '), cb );
  }
  commands.search( split.join(' '), cb );
}

// open the repl session
var prompt = repl.start({ prompt: 'placeholder > ', eval: myEval });
