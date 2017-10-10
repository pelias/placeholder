
var lowercase = require('lower-case'),
    removeAccents = require('remove-accents');

/**
  note: these functions return arrays which can be used to return synonymous
  versions of the same tokens.
**/

function normalize( input ){

  // sanity check arguments
  if( typeof input !== 'string' ){ return []; }

  // trim input of superfluous whitespace
  input = input.trim();

  // string is empty
  if( 0 === input.length ){ return []; }

  // whosonfirst sometimes uses '-1' instead of ''
  if( input === '-1' ){ return []; }

  // remove certain punctuation
  input = input.replace(/[\.]+/g,'');

  // replace certain punctuation with spaces
  input = input.replace(/[",]+/g,' ');

  // remove 'disambiguation' tokens from name suffix
  // see: https://github.com/whosonfirst-data/whosonfirst-data/issues/885
  input = input.replace(/(\s+([-֊־‐‑﹣]|[\(\[])).*$/, '');

  // input consists of only numbers
  if( /^\d+$/.test( input ) ){ return []; }

  // input consists of only numbers
  if( /^\d+$/.test( input ) ){ return []; }

  // generic synonym contractions
  input = input.replace(/\b(sainte)\b/gi, 'ste')
               .replace(/\b(saint)\b/gi, 'st')
               .replace(/\b(mount)\b/gi, 'mt')
               .replace(/\b(fort)\b/gi, 'ft');

  // input can have multiple synonymous representations
  var synonyms = [ input ];

  // synonymous representations of hyphens and apostrophes
  if( input.match(/['‘’-]+/) ){
    synonyms = synonyms.map( function( synonym ){
      return synonym.replace(/['‘’-]+/g, '');
    }).concat( synonyms.map( function( synonym ){
      return synonym
        .replace(/(['‘’]s)/g, '')
        .replace(/['‘’-]+/g, ' ');
    }));
  }

  // simple replacements
  if( input.match(/[&ßœ̆]+/) ){
    synonyms = synonyms.map( function( synonym ){
      return synonym
        .replace(/ & /g, ' and ')
        .replace(/ß/g, 'ss')
        .replace(/œ̆/g, 'oe');
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

  // synonymous representations of official designations
  if( input.match(/county|city/i) ){
    synonyms = synonyms.concat(
      synonyms.map( function( synonym ){
        return synonym
          .replace(/^county\s(of\s)?(.*)$/gi, '$2')
          .replace(/^(.*)\scounty$/gi, '$1')
          .replace(/^city\sof(?!\s?the)\s?(.*)$/gi, '$1');
      })
    );
  }

  // replace multiple spaces with a single space and trim tokens
  return synonyms.map( function( synonym ){
    return synonym.replace(/\s{2,}/g, ' ').trim();
  })
  // basic normalization
  // note: lowercase MUST be run before removeAccents, please don't change the order
  // see: https://github.com/pelias/placeholder/pull/12 for more detail.
  .map( function( synonym ){
    return removeAccents( lowercase( synonym ) );
  })
  // remove empty synonyms
  .filter( function( synonym ){
    return synonym && synonym.length;
  })
  // remove duplicate synonyms
  .filter( function( synonym, pos, self ){
    return self.indexOf(synonym) === pos;
  });
}

function tokenize( input ){
  return normalize(input).map( function( synonym ){
    return synonym.split(/\s+/g);
  });
}

module.exports.normalize = normalize;
module.exports.tokenize = tokenize;
