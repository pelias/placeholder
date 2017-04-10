
// plugin for token
var _ = require('lodash');

module.exports.findToken = function( token ){

  // find document ids which contain this token
  var docIds = this.graph.nodes[ token ] || [];

  // fetch a sorted uniq set of all child document ids
  var children = [];

  docIds.forEach( function( docId ){
    var childIds = this.graph.outEdges( docId ) || [];
    children = sortedMerge( children, childIds );
  }, this);

  return {
    matches: docIds,
    children: children
  };
};

/**
  merge two sorted arrays
**/
function sortedMerge(arr1, arr2) {
    var arr = [];
    var arr1_el = arr1[0];
    var arr2_el = arr2[0];
    var i = 1;
    var j = 1;

    while (arr1_el || arr2_el) {
        if (arr1_el<arr2_el || (arr1_el && !arr2_el) ) {
            arr.push(arr1_el);
            arr1_el = arr1[i++];
        } else {
            arr.push(arr2_el);
            arr2_el = arr2[j++];
        }
    }

    return arr;
}
