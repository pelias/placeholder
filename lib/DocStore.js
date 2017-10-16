
var sqlite3 = require('sqlite3');
sqlite3.verbose();

var codec = {
  encode: function( decoded ){
    return JSON.stringify( decoded );
  },
  decode: function( encoded ){
    return JSON.parse( encoded.json );
  }
};

// connect to and configure sqlite3 database
function DocStore(){}

DocStore.prototype.open = function( path, options ){

  if( options && true === options.readonly ){
    this.db = new sqlite3.Database( path, sqlite3.OPEN_READONLY );
  } else {
    this.db = new sqlite3.Database( path );
  }

  this.configure();
};

DocStore.prototype.close = function(){
  this.db.close();
};

DocStore.prototype.configure = function(){
  this.db.serialize(function(){
    this.db.run('PRAGMA main.foreign_keys=OFF;'); // we don't enforce foreign key constraints
    this.db.run('PRAGMA main.page_size=4096;'); // (default: 1024)
    this.db.run('PRAGMA main.cache_size=-2000;'); // (default: -2000, 2GB)
    this.db.run('PRAGMA main.synchronous=OFF;');
    this.db.run('PRAGMA main.journal_mode=OFF;');
    this.db.run('PRAGMA main.temp_store=MEMORY;');
  }.bind(this));
};

DocStore.prototype.reset = function(){
  this.db.serialize(function(){
    this.db.run('DROP TABLE IF EXISTS docs;');
    this.db.run('DROP TABLE IF EXISTS lineage;');
    this.db.run('DROP TABLE IF EXISTS tokens;');
    this.db.run('DROP TABLE IF EXISTS fulltext;');
    this.db.run('VACUUM;');

    this.db.run('CREATE TABLE docs( id INTEGER PRIMARY KEY, json TEXT );');
    this.db.run('CREATE TABLE lineage( id INTEGER, pid INTEGER );');
    this.db.run('CREATE TABLE tokens( id INTEGER, lang STRING, token STRING );');

    var options = [
      'token',
      'tokenize="' + [
        'unicode61',
        'remove_diacritics 0',
        'tokenchars \'_\''
      ].join(' ') + '"',
      'prefix=1',
      'prefix=2',
      'prefix=3',
      'prefix=4',
      'prefix=5',
      'prefix=6',
      'prefix=7',
      'prefix=8',
      'content=\'\'',
      'detail=none',
      'columnsize=0'
    ].join(', ');

    this.db.run('CREATE VIRTUAL TABLE fulltext USING fts5(' + options + ');');
  }.bind(this));
};

DocStore.prototype.preCommit = function(){
  this.db.serialize(function(){

    console.error('create indices...');
    this.db.run('CREATE INDEX IF NOT EXISTS lineage_cover_idx ON lineage(id, pid);');
    this.db.run('CREATE INDEX IF NOT EXISTS tokens_cover_idx ON tokens(id, lang);');

    // this is quite large, could use the fulltext index instead?
    this.db.run('CREATE INDEX IF NOT EXISTS tokens_token_idx ON tokens(token);');

    console.error('create fulltext table...');
    this.db.run('INSERT INTO fulltext(rowid, token) SELECT rowid, REPLACE(token," ","_") FROM tokens;');

    console.error('optimize fulltext table...');
    this.db.run('INSERT INTO fulltext(fulltext) VALUES(\'optimize\');');

    console.error('vacuuming sqlite db...');
    this.db.run('VACUUM;');
  }.bind(this));
};

DocStore.prototype.set = function( id, doc, cb ){
  this.db.run(
    'INSERT INTO docs ( id, json ) VALUES ( $id, $json );',
    { $id: id, $json: codec.encode( doc ) }, cb
  );
};

DocStore.prototype.setLineage = function( id, pids, cb ){
  if( !Array.isArray( pids ) || !pids.length ){ return cb(); }
  this.db.run(
    'INSERT INTO lineage ( id, pid ) VALUES ' + pids.map( pid => {
      return '(' + id + ',' + pid + ')';
    }).join(',') + ';',
    cb
  );
};

DocStore.prototype.setTokens = function( id, tokens, cb ){
  if( !Array.isArray( tokens ) || !tokens.length ){ return cb(); }
  this.db.run(
    'INSERT INTO tokens ( id, lang, token ) VALUES ' + tokens.map( token => {
      return '(' + id + ',"' + token.lang + '","' + token.body + '")';
    }).join(',') + ';',
    cb
  );
};

DocStore.prototype.get = function( id, cb ){
  this.db.get(
    'SELECT json FROM docs WHERE id = $id LIMIT 1;',
    { $id: id }, function( err, doc ){
      if( err ){ return cb( err ); }
      if( !doc ){ return cb( 'not found' ); }
      return cb( null, codec.decode( doc ) );
    }
  );
};

DocStore.prototype.getMany = function( ids, cb ){
  this.db.all(
    'SELECT json FROM docs WHERE id IN ($ids);'.replace('$ids', ids.join(',')), function( err, docs ){
      if( err ){ return cb( err ); }
      if( !docs ){ return cb( 'not found' ); }
      return cb( null, docs.map( codec.decode ));
    }
  );
};

module.exports = DocStore;
