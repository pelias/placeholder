
var util = require('util');
var Database = require('./Database');
var Queries = require('./Queries');

// document store database
function TokenIndex(){}
util.inherits( TokenIndex, Database );

// @todo: more elegant polymorphism
for( var method in Queries ){
  TokenIndex.prototype[method] = Queries[method];
}

TokenIndex.prototype.reset = function(){
  this.db.exec('DROP TABLE IF EXISTS lineage;');
  this.db.exec('CREATE TABLE lineage( id INTEGER, pid INTEGER );');
  this.db.exec('CREATE INDEX IF NOT EXISTS lineage_cover_idx ON lineage(id, pid);');

  this.db.exec('DROP TABLE IF EXISTS tokens;');
  this.db.exec('CREATE TABLE tokens( id INTEGER, layer STRING, lang STRING, tag STRING, token STRING );');
  this.db.exec('CREATE INDEX IF NOT EXISTS tokens_cover_idx ON tokens(id, layer, lang, tag);');
  this.db.exec('CREATE INDEX IF NOT EXISTS tokens_token_idx ON tokens(token);');

  // FTS table options
  // see: https://sqlite.org/fts5.html
  var options = [
    `tokenize="unicode61 remove_diacritics 0 tokenchars '_'"`,
    `prefix='1 2 3 4 5 6 7 8 9 10 11 12'`,
    'columnsize=0'
  ].join(', ');
  this.db.exec('DROP TABLE IF EXISTS fulltext;');
  this.db.exec('CREATE VIRTUAL TABLE fulltext USING fts5( token, ' + options + ');');
};

// ensure that the database schema matches what is expected by the codebase
TokenIndex.prototype.checkSchema = function(){
  Database.assertSchema(this.db, 'lineage', [
    { cid: 0, name: 'id', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 },
    { cid: 1, name: 'pid', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 }
  ]);
  Database.assertSchema(this.db, 'tokens', [
    { cid: 0, name: 'id', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 },
    { cid: 1, name: 'layer', type: 'STRING', notnull: 0, dflt_value: null, pk: 0 },
    { cid: 2, name: 'lang', type: 'STRING', notnull: 0, dflt_value: null, pk: 0 },
    { cid: 3, name: 'tag', type: 'STRING', notnull: 0, dflt_value: null, pk: 0 },
    { cid: 4, name: 'token', type: 'STRING', notnull: 0, dflt_value: null, pk: 0 }
  ]);
  Database.assertSchema(this.db, 'fulltext', [
    { cid: 0, name: 'token', type: '', notnull: 0, dflt_value: null, pk: 0 }
  ]);
};

TokenIndex.prototype.populate = function(){
  this.db.exec('INSERT INTO fulltext(rowid, token) SELECT rowid, REPLACE(token," ","_") FROM tokens;');
  this.db.exec('INSERT INTO fulltext(fulltext) VALUES(\'optimize\');');
};

TokenIndex.prototype.setLineage = function( id, pids, cb ){
  if( !Array.isArray( pids ) || !pids.length ){ return cb(); }

  // create prepared statement
  var stmt = this.prepare('INSERT INTO lineage ( id, pid ) VALUES ( $id, $pid )');

  try {
    pids.forEach( pid => stmt.run({ id: id, pid: pid }) );
    return cb( null );
  } catch ( err ){
    console.error( err );
    console.error( stmt.source );
    return cb( err );
  }
};

TokenIndex.prototype.setTokens = function( id, tokens, cb ){
  if( !Array.isArray( tokens ) || !tokens.length ){ return cb(); }

  // create prepared statement
  var stmt = this.prepare(
    'INSERT INTO tokens ( id, layer, lang, tag, token ) VALUES ( $id, $layer, $lang, $tag, $token )'
  );

  try {
    tokens.forEach( token => stmt.run({
      id: id,
      layer: token.layer,
      lang: token.lang,
      tag: token.tag,
      token: token.body
    }));
    return cb( null );
  } catch ( err ){
    console.error( err );
    console.error( stmt.source );
    return cb( err );
  }
};

module.exports = TokenIndex;
