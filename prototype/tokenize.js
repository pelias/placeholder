
// plugin for tokenize
var _ = require('lodash'),
    async = require('async'),
    analysis = require('../lib/analysis'),
    permutations = require('../lib/permutations');

module.exports.tokenize = function( input, cb ){

  // @todo: clean up
  var self = this;

  // tokenize input
  var synonyms = analysis.tokenize( input );
  async.map( synonyms, function( tokens, cb1 ){

    // console.log( 'tokens', tokens );

    // expand token permutations
    var perms = _.uniq( permutations.expand( tokens ).map( function( perm ){
      return perm.join(' ');
    }));
    // console.log( 'perms', perms );

    var finalToken = perms[ perms.length -1 ];

    async.filterSeries( perms, function( token, cb ){

      // @todo: could be affected by edge cases where tokens are repeated?
      var containsFinalToken = ( token.lastIndexOf( finalToken ) === token.length - finalToken.length );
      var method = ( containsFinalToken ) ? 'hasSubjectAutocomplete' : 'hasSubject';
      // var method = 'hasSubjectAutocomplete';

      // console.error( token );
      // console.error( method, '\t', token );

      self.index[method]( token, function( bool ){
        return cb( null, bool );
      });
    }, function( err, validTokens ){

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
      return cb1( null, window );
    });
  }, function ( err, queries ){

    // remove empty arrays
    queries = queries.filter( function( query ){
      return !!query.length;
    });

    // synonymous groupings
    // this removes queries such as `[ B, C ]` where another group such as
    // `[ A, B, C ]` exists.
    // see: https://github.com/pelias/placeholder/issues/28
    queries = queries.filter( function( query, i ){
      for( var j=0; j<queries.length; j++ ){
        if( j === i ){ continue; }
        if( _.isEqual( query, queries[j].slice( -query.length ) ) ){
          return false;
        }
      }
      return true;
    });

    return cb( null, queries );
  });
};
