
var Sqlite3 = require('better-sqlite3');

// generic sqlite database
function Database(){}

Database.prototype.open = function( path, options ){

  // set up a safe environment for running tests.
  // note: usually in-memory databases using the same
  // path would share the same database reference.
  if( options && true === options.test ){
    options.memory = true;
    path += Math.random().toString(36).substr(2);
  }

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
  this.db.pragma('foreign_keys=OFF'); // we don't enforce foreign key constraints
  this.db.pragma('page_size=4096'); // (default: 1024)
  this.db.pragma('cache_size=-2000'); // (default: -2000, 2GB)
  this.db.pragma('synchronous=OFF');
  this.db.pragma('journal_mode=OFF');
  this.db.pragma('temp_store=MEMORY');
};

Database.prototype.reset = function(){ /* no-op */ };
Database.prototype.populate = function(){ /* no-op */ };
Database.prototype.checkSchema = function(){ /* no-op */ };
Database.prototype.optimize = function(){
  this.db.exec('VACUUM');
};

// convenience function to validate a table schema against
// an expected schema, throwing an error if they do not match.
Database.assertSchema = function( db, tableName, expected ){
  const actual = db.prepare('PRAGMA table_info(' + tableName + ')').all();
  if( JSON.stringify(actual) !== JSON.stringify(expected) ){
    throw new Error( 'schema invalid: table ' + tableName );
  }
};

module.exports = Database;
