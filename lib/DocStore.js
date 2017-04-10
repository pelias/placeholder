
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

DocStore.prototype.open = function( path ){
  this.db = new sqlite3.Database( path );
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
    this.db.run('VACUUM;');
    this.db.get('CREATE TABLE docs( id INTEGER PRIMARY KEY, json TEXT );');
  }.bind(this));
};

DocStore.prototype.set = function( id, doc, cb ){
  this.db.run(
    'INSERT INTO docs ( id, json ) VALUES ( $id, $json );',
    { $id: id, $json: codec.encode( doc ) }, cb
  );
};

DocStore.prototype.get = function( id, cb ){
  this.db.get(
    'SELECT json FROM docs WHERE id = $id LIMIT 1;',
    { $id: id }, function( err, doc ){
      if( err ){ return cb( err ); }
      return cb( null, codec.decode( doc ) );
    }
  );
};

DocStore.prototype.getMany = function( ids, cb ){
  this.db.all(
    'SELECT json FROM docs WHERE id IN ($ids);'.replace('$ids', ids.join(',')), function( err, docs ){
      if( err ){ return cb( err ); }
      return cb( null, docs.map( codec.decode ));
    }
  );
};

module.exports = DocStore;
