
var lowercase = require('lower-case'),
    removeAccents = require('remove-accents');

/**
  note: these functions return arrays which can be used to return synonymous
  versions of the same tokens.
**/

function normalize( input ){

  // sanity check arguments
  if( !input || !input.length ){ return []; }

  // replace certain punctuation with spaces
  input = input.replace(/[",\.]+/g,' ');

  // input can have multiple synonymous representations
  var synonyms = [ input ];

  // synonymous representations of hyphens and apostrophes
  if( input.match(/['-]+/) ){
    synonyms = [
      input.replace(/['-]+/g,''),
      input.replace(/['-]+/g,' '),
    ];
  }

  // simple replacements
  if( input.match(/[&ß]+/) ){
    synonyms = synonyms.map( function( synonym ){
      return synonym
        .replace(/ & /g, ' and ')
        .replace(/ß/g, 'ss');
    });
  }

  // synonymous representations of umlauts / special letters
  if( input.match(/[üöäÄÜÖ]+/) ){
    synonyms = synonyms.concat(
      synonyms.map( function( synonym ){
        return synonym
          .replace(/ü/g, 'ue')
          .replace(/ö/g, 'oe')
          .replace(/ä/g, 'ae')
          .replace(/Ä/g, 'Ae')
          .replace(/Ü/g, 'Ue')
          .replace(/Ö/g, 'Oe');
      })
    );
  }

  // replace multiple spaces with a single space
  return synonyms.map( function( synonym ){
    return synonym.replace(/\s{2,}/g, ' ');
  })
  // basic normalization
  .map( function( synonym ){
    return removeAccents( lowercase( synonym ) );
  })
  // remove empty tokens
  .filter( function( token ){
    return token && token.length;
  });
}

function tokenize( input ){
  return normalize(input).map( function( synonym ){
    return synonym.split(/\s+/g);
  });
}

module.exports.normalize = normalize;
module.exports.tokenize = tokenize;
