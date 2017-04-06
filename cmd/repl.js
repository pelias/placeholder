
var repl = require('repl'),
    Placeholder = require('../Placeholder'),
    ph = new Placeholder();

// init placeholder
ph.load();

// commands
var cmd = {
  search: function( input ){
    console.time('took');
    var tokens = ph.tokenize( input );
    var results = ph.query( tokens );
    results.forEach( function( resultId ){
      var doc = ph.store.get( resultId );
      console.log( ' -', [ resultId, doc.placetype + ' ', doc.name ].join('\t') );
    });
    console.timeEnd('took');
  },
  token: function( body ){
    console.time('took');
    console.log( ph.graph.nodes[ body ] );
    console.timeEnd('took');
  },
  id: function( id ){
    console.time('took');
    console.log( ph.store.get( id ) );
    console.timeEnd('took');
  }
};

// open the repl session
var prompt = repl.start({ prompt: 'placeholder > ' });

// attach my modules to the repl context
prompt.context.search = cmd.search;
prompt.context.token = cmd.token;
prompt.context.id = cmd.id;
