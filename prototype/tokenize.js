
// plugin for tokenize
const _ = require('lodash'),
    async = require('async'),
    analysis = require('../lib/analysis'),
    permutations = require('../lib/permutations');

function tokenize( input, cb ){

  // @todo: clean up
  const self = this;

  // tokenize input
  const synonyms = analysis.tokenize( input );

  const mapEach = ( tokens, mapCb ) => {

    // expand token permutations
    const perms = _permutations(tokens);

    // @todo: improve this?
    const finalToken = perms[ perms.length -1 ];

    const truthTest = function( phrase, cb ){

      // @todo: could be affected by edge cases where tokens are repeated?
      var containsFinalToken = ( phrase.lastIndexOf( finalToken ) === phrase.length - finalToken.length );
      var method = ( containsFinalToken ) ? 'hasSubjectAutocomplete' : 'hasSubject';

      self.index[method]( phrase, function( bool ){
        return cb( null, bool );
      });
    };

    // run the filter
    async.filterSeries( perms, truthTest, (err, matchedPermutations) => {
      return mapCb( null, _groups(tokens, matchedPermutations) );
    });
  };

  // run map
  async.map( synonyms, mapEach, (err, queries) => {
    return cb( null, _queryFilter( queries ) );
  });
}

// expand token permutations
function _permutations(tokens){
  return _.uniq(permutations.expand(tokens).map(perm => perm.join(' ')));
}

// remove unwanted queries
function _queryFilter(queries){

  // remove empty arrays
  queries = queries.filter( function( query ){
    return 0 !== query.length;
  });

  // remove synonymous groupings
  queries = queries.filter( function( query, i ){
    for( var j=0; j<queries.length; j++ ){
      if( j === i ){ continue; }
      if( _.isEqual( query, queries[j].slice( -query.length ) ) ){
        return false;
      }
    }
    return true;
  });

  return queries;
}

// a convenience function to very efficiently compare a range
// of elements in array A to the entirety of array B.
function _isArrayRangeIsEqual( A, B, offset ){
  if( A.length-(offset||0) < B.length ){ return false; }
  for( var i=0; i<B.length; i++ ){
    if( A[(offset||0)+i] !== B[i] ){
      return false;
    }
  }
  return true;
}

// select the optimal phrases from those found in the database
function _groups(tokens, phrases) {

  // sort the largest phrases first
  phrases.sort((a, b) => b.length - a.length);

  // generate a map of matched phrases where the
  // key is a single word token (the first word in
  // the phrase) and the values is an array of
  // phrases which contain that word.
  const index = {};
  phrases.forEach( phrase => {
    const words = phrase.split(/\s+/);
    const firstWord = words[0];
    if( !index.hasOwnProperty( firstWord ) ){
      index[ firstWord ] = [];
    }
    index[ firstWord ].push( words );
  });

  // an array of the chosen phrases
  const groups = [];

  // iterate over the input tokens
  for( var t=0; t<tokens.length; t++ ){
    var token = tokens[t];
    var matches = index[token];

    // skip tokens with no matching phrases in the index
    if( !matches ){ continue; }

    // iterate over each matching phrase in the index
    for( var z=0; z<matches.length; z++ ){
      var phrase = matches[z];

      // select the longest matching phrase
      if( !_isArrayRangeIsEqual( tokens, phrase, t ) ){ continue; }

      // add the match to the groups array
      groups.push( phrase.join(' ') );

      // advance the iterator to skip any other words in the phrase
      t += phrase.length -1;
      break;
    }
  }

  return groups;
}

module.exports.tokenize = tokenize;
module.exports._permutations = _permutations;
module.exports._queryFilter = _queryFilter;
module.exports._groups = _groups;
module.exports._isArrayRangeIsEqual = _isArrayRangeIsEqual;
