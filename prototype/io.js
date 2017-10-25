
// plugin to handle I/O
const path = require('path');

// load data from disk
module.exports.load = function( opts ){
  const dataDir = process.env.PLACEHOLDER_DATA || path.join( __dirname, '../data/');
  const dbPath = path.join( dataDir, 'store.sqlite3' );

  this.store.open( dbPath, opts ); // document store
  this.index.open( dbPath, opts ); // token index
};

// populate databases
module.exports.populate = function(){
  this.store.populate();
  this.index.populate();
};

// optimize databases
module.exports.optimize = function(){
  this.index.optimize();
};

// gracefully close connections
module.exports.close = function(){
  this.store.close();
  this.index.close();
};
