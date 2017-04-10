
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
    }).filter( function( perm ){
      return !!this.graph.nodes[ perm ];
    }, this) );
    // console.log( 'validTokens', validTokens );

    // sort the longest matches first
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

    // var windows = [];

    var makeWindow = function( tokens, matches ){

      // console.log( '-------' );
      // console.log( tokens );
      // console.log( JSON.stringify( matches ) );

      var window = [];
      for( var t=0; t<tokens.length; t++ ){
        var token = tokens[t];
        // console.log( token );
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
      return window;
    };

    var windows = [];

    for( var word in matches ){
      // console.log( 'word', word );

      var potentialTokens = matches[ word ];
      if( 1 === potentialTokens.length ){
        windows.push( makeWindow( tokens, matches ) );
      } else {
        potentialTokens.forEach( function( potToken ){
          var tmp = _.cloneDeep( matches );
          tmp[ word ] = _.without( tmp[ word ], potToken );
          windows.push( makeWindow( tokens, tmp ) );
        });
      }


    }

    // remove duplicate windows
    windows = _.uniqWith( windows, function( a, b ){
      return a.join('|') === b.join('|');
    });

    // find the longest window length
    var longest = 0;
    windows.forEach( function( win ){
      var wordLength = win.reduce( function( acc, cur ){
        return acc + cur.split(' ').length;
      }, 0);
      if( wordLength > longest ){
        longest = wordLength;
      }
    });

    // remove any which are not the longest
    windows = windows.filter( function( win ){
      var wordLength = win.reduce( function( acc, cur ){
        return acc + cur.split(' ').length;
      }, 0);
      return wordLength === longest;
    });

    // makeWindow( tokens, matches );

    // console.log( 'window', window );
    return windows;
  }, this);

  // console.log( '[', queries.join( ', ' ), ']' );

  var flat = [];
  queries.forEach( function( q ){
    flat = flat.concat( q );
  });

  return flat;
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
