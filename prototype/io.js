
// plugin to handle I/O
var fs = require('fs'),
    path = require('path');

var dataDir = process.env.PLACEHOLDER_DATA || path.join( __dirname, '../data/');
var storePath = path.join( dataDir, 'store.sqlite3' );

// WIP
var Database = require('../wip/Database');
var SqlDatabase = require('../wip/SqlDatabase');

// load data from disk
module.exports.load = function( opts ){
  this.store.open( storePath );
  if( opts && opts.reset === true ){
    this.store.reset();
  }

  // sql
  var db = new SqlDatabase( this.store.db );

  // leveldb
  // var db = new Database('./db' );

  // both
  var tokenize = require('../wip/test_tokenize').tokenize.bind({ db: db });
  var query = require('../wip/query').query.bind( null, db, tokenize );

  // WIP
  this.wip = {
    db: db,
    tokenize: tokenize,
    query: query
  };
};

// save data to disk
module.exports.save = function( path ){
  this.close();
};

// gracefully close connections
module.exports.close = function(){
  this.store.close();
};
