
// plugin for token
var _ = require('lodash');

module.exports.findToken = function( token ){

  // find document ids which contain this token
  var docIds = this.graph.nodes[ token ] || [];

  // skip tokens with no associated document
  if( !docIds.length ){
    // console.error( 'skipping token', token );
    return {
      matches: docIds,
      children: []
    };
  }

  var children = _.sortBy( _.flatten( docIds.map( function( docId ){
    return this.graph.outEdges( docId ) || [];
  }, this)));

  return {
    matches: docIds,
    children: children
  };
};
