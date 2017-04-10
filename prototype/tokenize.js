
// plugin for tokenize
var _ = require('lodash'),
    analysis = require('../lib/analysis'),
    permutations = require('../lib/permutations');

module.exports.tokenize = function( input ){

  // tokenize input
  var synonyms = analysis.tokenize( input );
  var queries = synonyms.map( function( tokens ){

    // console.log( 'tokens', tokens );

    // expand token permutations
    var perms = permutations.expand( tokens );
    // console.log( 'perms', perms );

    // valid tokens are those which exist in the index
    var validTokens = _.uniq( perms.map( function( perm ){
      return perm.join(' ');
    }).filter( this.graph.hasToken, this.graph ) );
    // console.log( 'validTokens', validTokens );

    // sort the largest matches first
    validTokens.sort( function( a, b ){
      return b.length - a.length;
    });

    //
    var matches = {};
    validTokens.forEach( function( row ){
      var words = row.split(' ');
      var word = words[0];
      if( !matches.hasOwnProperty( word ) ){
        matches[ word ] = [];
      }
      matches[ word ].push( row );
    });

    // console.log( 'matches', matches );

    var window = [];
    for( var t=0; t<tokens.length; t++ ){
      var token = tokens[t];
      if( matches.hasOwnProperty( token ) ){

        for( var z=0; z<matches[token].length; z++ ){
          var match = matches[token][z];
          var split = match.split(/\s+/);

          if( tokens.slice( t, t + split.length ).join(' ') === match ){
            window.push( match );
            t += split.length -1;
            break;
          }
        }
      }
    }

    // console.log( 'window', window );
    return window;
  }, this);

  // console.log( '[', queries.join( ', ' ), ']' );
  return queries;
};

// function cartesianProductOf( arr ) {
//     return _.reduce(arr, function(a, b) {
//         return _.flatten(_.map(a, function(x) {
//             return _.map(b, function(y) {
//                 return x.concat([y]);
//             });
//         }), true);
//     }, [ [] ]);
// }
