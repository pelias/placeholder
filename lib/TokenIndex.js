
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
  this.db.exec('CREATE TABLE tokens( id INTEGER, lang STRING, tag STRING, token STRING );');
  this.db.exec('CREATE INDEX IF NOT EXISTS tokens_cover_idx ON tokens(id, lang, tag);');
  this.db.exec('CREATE INDEX IF NOT EXISTS tokens_token_idx ON tokens(token);');

  // FTS table options
  // see: https://sqlite.org/fts5.html
  var options = [
    'tokenize="unicode61 remove_diacritics 0 tokenchars \'_\'"',
    'prefix=\'1 2 3 4 5 6 7 8 9 10 11 12\'',
    'columnsize=0'
  ].join(', ');
  this.db.exec('DROP TABLE IF EXISTS fulltext;');
  this.db.exec('CREATE VIRTUAL TABLE fulltext USING fts5( token, ' + options + ');');
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
    'INSERT INTO tokens ( id, lang, tag, token ) VALUES ( $id, $lang, $tag, $token )'
  );

  try {
    tokens.forEach( token => stmt.run({
      id: id,
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
