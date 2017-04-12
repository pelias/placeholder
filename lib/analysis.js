
var lowercase = require('lower-case'),
    removeAccents = require('remove-accents');

/**
  note: these functions return arrays which can be used to return synonymous
  versions of the same tokens.
**/

function normalize( input ){

  // replace chars with spaces
  input = (input || '').replace(/[",\.]+/g,' ');

  // input can have multiple synonymous representations
  var synonyms = [];

  // handle hyphens and apostrophes
  if( !input.match(/['-]+/) ){
    synonyms = [ input ];
  } else {
    synonyms = [
      input.replace(/['-]+/g,''),
      input.replace(/['-]+/g,' '),
    ];
  }

  return synonyms.map( function( synonym ){
    return synonym.replace(/\s{2,}/g, ' ');
  }).map( function( synonym ){
    return removeAccents( lowercase( synonym ) );
  }).filter( function( token ){
    return !!token; // remove empty tokens
  });
}

function tokenize( input ){
  return normalize(input).map( function( synonym ){
    return synonym.split(/\s+/g);
  });
}

module.exports.normalize = normalize;
module.exports.tokenize = tokenize;
