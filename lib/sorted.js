
var _ = require('lodash'),
    intersect = require('sorted-intersect');

/**
  algorithms optimized for sorted sets

  note: algorithm selection here can have a massive impact on performance.
**/

/**
  merge two sorted arrays and ensure the result contains unique values
**/
function sortedMergeUniq( a, b ) {

  if( a.length < 1 ){ return b; }
  if( b.length < 1 ){ return a; }

  var arr = [];
  var aa = 0, bb = 0;
  var A = a[0], B = b[0];
  var C = -Infinity;

  while( true ) {

    // seek iterators past current value
    while( A <= C ){ A = a[aa++]; }
    while( B <= C ){ B = b[bb++]; }
    if( !A && !B ){ break; }

    if( A < B || ( A && !B ) ) {
      arr.push( A ); C = A;
    } else {
      arr.push( B ); C = B;
    }
  }

  return arr;
}

// sorting comparitors
var comparitor = { number: { asc: function( a, b ) {
  return a - b;
}}};

function sort( arr ){ return arr.sort( comparitor.number.asc ); }

module.exports.merge = sortedMergeUniq;
module.exports.intersect = intersect;
module.exports.sort = sort;
module.exports.unique = _.sortedUniq;
