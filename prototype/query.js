
// plugin for query
var sorted = require('../lib/sorted');

module.exports.queryOne = function( tokens ){

  var workingSet = [];
  var firstToken = true;

  var res = {
    ids: [],
    match: {
      token: '_NONE_MATCHED_',
      position: 0
    }
  };

  for( var i=tokens.length-1; i>=0; i-- ){

    var token = tokens[i];
    var found = this.findToken( token );

    if( found.matches.length ){
      if( firstToken ){
        // console.log( 'initial' );
        workingSet = found.children;
        res.ids = found.matches;
        res.match.token = token;
        res.match.position = tokens.length - i;
      } else {
        // console.log( 'intersect' );
        var t = sorted.intersect([ found.matches, workingSet ]);

        if( t.length ){
          res.ids = t;
          workingSet = sorted.intersect([ found.children, workingSet ]);
          res.match.token = token;
          res.match.position = tokens.length - i;
        }
        //else {
        // console.error( 'skip', token );
        //}

      }
    } else {
      // console.error( 'bailing out at', token );
      return res;
    }

    // console.log( 'found', {
    //   token: token,
    //   matches: found.matches.length,
    //   children: found.children.length,
    //   workingSet: workingSet.length
    // });

    firstToken = false;
  }

  return res;
};

module.exports.query = function( permutations ){

  var res = {
    ids: [],
    match: {
      token: '_NONE_MATCHED_',
      position: 0,
      index: 0
    }
  };

  for( var p=0; p<permutations.length; p++ ){
    var q = this.queryOne( permutations[p] );
    res.ids = sorted.merge( res.ids, q.ids );

    // select the most granular token from all permutations
    if( q.match.position > res.match.position ){
      res.match = q.match;
      res.match.index = p;
    }
  }

  return res;
};
