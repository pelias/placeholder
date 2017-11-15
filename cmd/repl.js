
var repl = require('repl'),
    Placeholder = require('../Placeholder'),
    ph = new Placeholder();

// init placeholder
ph.load();

// commands
var commands = {
  search: function( input, cb ){
    console.time('took');
    ph.query( input, ( err, ids, mask, group ) => {
      ph.store.getMany( ids, function( err, docs ){
        if( err ){ return console.error( err ); }
        docs.forEach( function( doc ){
          console.log( ' -', [ doc.id, doc.placetype + ' ', doc.name ].join('\t') );
        });
        console.timeEnd('took');
        cb();
      });
    });
  },
  tokenize: function( input, cb ){
    console.time('took');
    ph.tokenize( input, ( err, groups ) => {
      console.timeEnd('took');
      console.log( groups );
      cb();
    });
  },
  token: function( body, cb ){
    console.log( 'token', '"' + body + '"' );
    console.time('took');
    ph.index.matchSubjectDistinctSubjectIds( body, ( err, rows ) => {
      const subjectIds = rows.map( row => { return row.subjectId; } );
      console.timeEnd('took');
      console.log( subjectIds );
      cb();
    });
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
