
var sqlite3 = require('sqlite3');
sqlite3.verbose();

// generic sqlite database
function Database(){}

Database.prototype.open = function( path, options ){

  // open connection
  if( options && true === options.readonly ){
    this.db = new sqlite3.Database( path, sqlite3.OPEN_READONLY );
  } else {
    this.db = new sqlite3.Database( path );
  }

  // configure database tables
  this.configure();

  // reset data (clear all previous data and recreate schemas)
  if( options && true === options.reset ){
    this.reset();
    this.optimize();
  }
};

Database.prototype.close = function(){
  this.db.close();
};

Database.prototype.configure = function(){
  this.db.serialize(() => {
    this.db.run('PRAGMA main.foreign_keys=OFF;'); // we don't enforce foreign key constraints
    this.db.run('PRAGMA main.page_size=4096;'); // (default: 1024)
    this.db.run('PRAGMA main.cache_size=-2000;'); // (default: -2000, 2GB)
    this.db.run('PRAGMA main.synchronous=OFF;');
    this.db.run('PRAGMA main.journal_mode=OFF;');
    this.db.run('PRAGMA main.temp_store=MEMORY;');
  }.bind(this));
};

Database.prototype.reset = function(){ /* no-op */ };
Database.prototype.populate = function(){ /* no-op */ };
Database.prototype.optimize = function(){
  this.db.run('VACUUM;');
};

Database.codec = {
  encode: ( decoded ) => {
    return JSON.stringify( decoded );
  },
  decode: ( encoded ) => {
    return JSON.parse( encoded.json );
  }
};

module.exports = Database;
