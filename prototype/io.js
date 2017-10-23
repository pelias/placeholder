
// plugin to handle I/O
var fs = require('fs'),
    path = require('path');

var dataDir = process.env.PLACEHOLDER_DATA || path.join( __dirname, '../data/');
var path = path.join( dataDir, 'store.sqlite3' );

// load data from disk
module.exports.load = function( opts ){
  this.store.open( path, opts ); // document store
  this.index.open( path, opts ); // token index
};

// gracefully close connections
module.exports.close = function(){
  this.store.close();
  this.index.close();
};
