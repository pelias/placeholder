
var Sqlite3 = require('better-sqlite3');

// generic sqlite database
function Database(){}

Database.prototype.open = function( path, options ){

  // open connection
  this.db = new Sqlite3( path, options );

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

Database.prototype.prepare = function( sql ){
  if( !this.hasOwnProperty('stmt') ){ this.stmt = {}; }
  if( !this.stmt.hasOwnProperty( sql ) ){
    this.stmt[ sql ] = this.db.prepare( sql );
  }
  return this.stmt[ sql ];
};

Database.prototype.configure = function(){
  this.db.pragma('main.foreign_keys=OFF'); // we don't enforce foreign key constraints
  this.db.pragma('main.page_size=4096'); // (default: 1024)
  this.db.pragma('main.cache_size=-2000'); // (default: -2000, 2GB)
  this.db.pragma('main.synchronous=OFF');
  this.db.pragma('main.journal_mode=OFF');
  this.db.pragma('main.temp_store=MEMORY');
};

Database.prototype.reset = function(){ /* no-op */ };
Database.prototype.populate = function(){ /* no-op */ };
Database.prototype.optimize = function(){
  this.db.exec('VACUUM');
};

module.exports = Database;
