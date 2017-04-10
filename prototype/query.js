
// plugin for query
var sorted = require('../lib/sorted');

module.exports.queryOne = function( tokens ){

  var workingSet = [];
  var validMatches = [];

  var token = tokens.pop();
  var firstToken = true;

  while( token ){
    var found = this.findToken( token );

    if( found.matches.length ){
      if( firstToken ){
        // console.log( 'initial' );
        workingSet = found.children;
        validMatches = found.matches;
      } else {
        // console.log( 'intersect' );
        var t = sorted.intersect([ found.matches, workingSet ]);

        if( t.length ){
          validMatches = t;
          workingSet = sorted.intersect([ found.children, workingSet ]);
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
  var matches = [];
  for( var p=0; p<permutations.length; p++ ){
    matches = sorted.merge( matches, this.queryOne( permutations[p] ) );
  }
  return matches;
};
