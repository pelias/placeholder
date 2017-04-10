
// plugin for query
var intersect = require('sorted-intersect');
var _ = require('lodash');

var autocompleteEnabled = true;

module.exports.queryOne = function( tokens ){

  var workingSet = [];
  var validMatches = [];

  var token = tokens.pop();
  var firstToken = true;

  while( token ){
    var found = this.findToken( token, ( autocompleteEnabled && tokens.length === 0 ) );

    if( found.matches.length ){
      if( firstToken ){
        // console.log( 'initial' );
        workingSet = found.children;
        validMatches = found.matches;
      } else {
        // console.log( 'intersect' );
        var t = intersect([ found.matches, workingSet ]);

        if( t.length ){
          validMatches = t;
          workingSet = intersect([ found.children, workingSet ]);
        } else {
          // console.error( 'skip', token );
        }

      }
    } else {
      // console.error( 'bailing out at', token );
      return validMatches;
    }

    // console.log( 'found', {
    //   token: token,
    //   matches: found.matches.length,
    //   children: found.children.length,
    //   workingSet: workingSet.length
    // });

    token = tokens.pop();
    firstToken = false;
  }

  return validMatches;
};

module.exports.query = function( permutations ){
  return _.sortedUniq( _.sortBy( _.flatten( permutations.map( module.exports.queryOne, this ) ) ) );
};
