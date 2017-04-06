
var lowercase = require('lower-case'),
    removeAccents = require('remove-accents');

/**
  note: these functions return arrays which can be used to return synonymous
  versions of the same tokens.
**/

function normalize( input ){
  var synonyms = [
    removeAccents( lowercase(( input || '' ).replace(/["',.]*/g,'') ) )
  ].filter( function( token ){
    return !!token; // remove empty tokens
  });
  return synonyms;
}

function tokenize( input ){
  return normalize(input).map( function( synonym ){
    return synonym.split(/\s/g);
  });
}

module.exports.normalize = normalize;
module.exports.tokenize = tokenize;
