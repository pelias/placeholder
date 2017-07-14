
// plugin to handle I/O
var fs = require('fs'),
    path = require('path');

var graphPath = process.env.PLACEHOLDER_DATA || path.join( __dirname, '../data/graph.json' );
var storePath = process.env.PLACEHOLDER_DATA || path.join( __dirname, '../data/store.sqlite3' );

// load data from disk
module.exports.load = function( opts ){
  this.store.open( storePath );
  if( opts && opts.reset === true ){
    this.store.reset();
  } else {
    var graph = require( graphPath );
    this.graph.nodes = graph.nodes;
    this.graph.edges = graph.edges;
  }
};

// load data from disk
module.exports.save = function( path ){
  fs.writeFileSync( graphPath, JSON.stringify( this.graph ) );
  this.close();
};

// gracefully close connections
module.exports.close = function(){
  this.store.close();
};

// deserialize data
// module.exports.import = function( data ){
//   this.graph.nodes = data.nodes;
//   this.graph.edges = data.edges;
//   this.store.docs  = data.docs;
// };
//
// // serialize data
// module.exports.export = function( path ){
//   return {
//     docs:  this.store.docs,
//     nodes: this.graph.nodes,
//     edges: this.graph.edges
//   };
// };
