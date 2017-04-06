
// plugin to handle I/O
var fs = require('fs'),
    path = require('path');

var graphPath = path.join( __dirname, '../data/graph.json' );
var storePath = path.join( __dirname, '../data/store.json' );

// load data from disk
module.exports.load = function( path ){
  var data = {
    graph: require( graphPath ),
    store: require( storePath )
  };

  this.graph.nodes = data.graph.nodes;
  this.graph.edges = data.graph.edges;
  this.store.docs  = data.store.docs;
};

// load data from disk
module.exports.save = function( path ){
  fs.writeFileSync( graphPath, JSON.stringify( this.graph ) );
  fs.writeFileSync( storePath, JSON.stringify( this.store ) );
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
