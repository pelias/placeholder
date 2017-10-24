
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
  this.db.serialize(() => {
    this.db.run('DROP TABLE IF EXISTS lineage;');
    this.db.run('CREATE TABLE lineage( id INTEGER, pid INTEGER );');
    this.db.run('CREATE INDEX IF NOT EXISTS lineage_cover_idx ON lineage(id, pid);');

    this.db.run('DROP TABLE IF EXISTS tokens;');
    this.db.run('CREATE TABLE tokens( id INTEGER, lang STRING, tag STRING, token STRING );');
    this.db.run('CREATE INDEX IF NOT EXISTS tokens_cover_idx ON tokens(id, lang, tag);');
    this.db.run('CREATE INDEX IF NOT EXISTS tokens_token_idx ON tokens(token);');

    // FTS table options
    // see: https://sqlite.org/fts5.html
    var options = [
      'tokenize="unicode61 remove_diacritics 0 tokenchars \'_\'"',
      'prefix=\'1 2 3 4 5 6 7 8 9 10 11 12\'',
      'columnsize=0'
    ].join(', ');
    this.db.run('DROP TABLE IF EXISTS fulltext;');
    this.db.run('CREATE VIRTUAL TABLE fulltext USING fts5( token, ' + options + ');');
  }.bind(this));
};

TokenIndex.prototype.populate = function(){
  this.db.serialize(() => {
    this.db.run('INSERT INTO fulltext(rowid, token) SELECT rowid, REPLACE(token," ","_") FROM tokens;');
    this.db.run('INSERT INTO fulltext(fulltext) VALUES(\'optimize\');');
  }.bind(this));
};

TokenIndex.prototype.setLineage = function( id, pids, cb ){
  if( !Array.isArray( pids ) || !pids.length ){ return cb(); }
  this.db.run(
    'INSERT INTO lineage ( id, pid ) VALUES ' + pids.map( pid => {
      return '(' + id + ',' + pid + ')';
    }).join(',') + ';',
    cb
  );
};

TokenIndex.prototype.setTokens = function( id, tokens, cb ){
  if( !Array.isArray( tokens ) || !tokens.length ){ return cb(); }
  this.db.run(
    'INSERT INTO tokens ( id, lang, tag, token ) VALUES ' + tokens.map( token => {
      return '(' + id + ',"' + token.lang + '","' + token.tag + '","' + token.body + '")';
    }).join(',') + ';',
    cb
  );
};

module.exports = TokenIndex;
