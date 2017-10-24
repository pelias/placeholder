
var util = require('util');
var Database = require('./Database');

// document store database
function DocStore(){}
util.inherits( DocStore, Database );

DocStore.prototype.reset = function(){
  this.db.exec('DROP TABLE IF EXISTS docs');
  this.db.exec('CREATE TABLE docs( id INTEGER PRIMARY KEY, json TEXT )');
};

DocStore.prototype.set = function( id, doc, cb ){

  // create prepared statement
  var stmt = this.prepare('INSERT INTO docs (id, json) VALUES ($id, $json)');

  try {
    stmt.run({ id: id, json: DocStore.codec.encode( doc ) });
    return cb( null );
  } catch ( err ){
    console.error( err );
    console.error( stmt.source );
    return cb( err );
  }
};

DocStore.prototype.get = function( id, cb ){

  // create prepared statement
  var stmt = this.prepare('SELECT json FROM docs WHERE id = ? LIMIT 1');

  try {
    var doc = stmt.get( id );
    if( !doc ){ return cb( 'not found' ); }
    return cb( null, DocStore.codec.decode( doc ) );
  } catch ( err ){
    console.error( err );
    console.error( stmt.source );
    return cb( err );
  }
};

DocStore.prototype.getMany = function( ids, cb ){

  if( !Array.isArray( ids ) || !ids.length ){
    return cb( null, [] );
  }

  // create prepared statement
  var stmt = this.prepare('SELECT json FROM docs WHERE id IN ' +
    '(' + Array(ids.length).fill('?').join(',') + ')'
  );

  // var stmt = this.prepare('SELECT json FROM docs WHERE id IN ( ? )');

  try {
    var docs = stmt.all( ids );
    if( !docs ){ return cb( 'not found' ); }
    return cb( null, docs.map( DocStore.codec.decode ));
  } catch ( err ){
    console.error( err );
    console.error( stmt.source );
    console.error( ids );
    return cb( err );
  }
};

// encode/decode json strings
DocStore.codec = {
  encode: ( decoded ) => {
    return JSON.stringify( decoded );
  },
  decode: ( encoded ) => {
    return JSON.parse( encoded.json );
  }
};

module.exports = DocStore;
