
// plugin for stats

// print some statistics
module.exports.printStatistics = function( path ){
  console.error( 'docs ', Object.keys( this.store.docs  ).length );
  console.error( 'nodes', Object.keys( this.graph.nodes ).length );
  console.error( 'edges', Object.keys( this.graph.edges ).length );
};
