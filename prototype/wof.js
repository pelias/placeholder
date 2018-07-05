
// plugin for whosonfirst
const _ = require('lodash'),
    dir = require('require-dir'),
    analysis = require('../lib/analysis'),
    language = dir('../config/language');

// list of languages / tags we favour in cases of deduplication
const LANG_PREFS = ['eng','und'];
const TAG_PREFS = ['preferred','abbr','label','variant','colloquial'];

// insert a wof record in to index
function insertWofRecord( wof, next ){

  var id = wof['wof:id'];
  if( 'string' === typeof id ){ id = parseInt( id, 10 ); }

  // sanity check; because WOF
  if( !isValidWofRecord( id, wof ) ) { return next(); }

  // --- document which will be saved in the doc store ---

  const doc = {
    id: id,
    name: wof['wof:label'] || wof['wof:name'],
    abbr: getAbbreviation( wof ),
    placetype: wof['wof:placetype'],
    rank: getRank( wof['wof:placetype'] ),
    population: getPopulation( wof ),
    popularity: wof['qs:photo_sum'],
    lineage: wof['wof:hierarchy'],
    geom: {
      area: wof['geom:area'],
      bbox: wof['lbl:bbox'] || wof['geom:bbox'],
      lat: wof['lbl:latitude'] || wof['geom:latitude'],
      lon: wof['lbl:longitude'] ||wof['geom:longitude']
    },
    names: {}
  };

  var tokens = [];
  var parentIds = [];

  // --- cast strings to numeric types ---
  // note: sometimes numeric properties in WOF can be encoded as strings.

  doc.population = _.toInteger( doc.population ) || undefined;
  doc.popularity = _.toInteger( doc.popularity ) || undefined;
  doc.geom.area = _.toFinite( doc.geom.area ) || undefined;
  doc.geom.lat = _.toFinite( doc.geom.lat );
  doc.geom.lon = _.toFinite( doc.geom.lon );

  // --- tokens ---

  // disable adding tokens to the index for the 'empire' placetype.
  // this ensures empire records are not retrieved via search.
  if( 'empire' !== doc.placetype ){

    // add 'wof:label'
    tokens.push({ lang: 'und', tag: 'label', body: wof['wof:label'] });

    // add 'wof:name'
    tokens.push({ lang: 'und', tag: 'label', body: wof['wof:name'] });

    // add 'wof:abbreviation'
    tokens.push({ lang: 'und', tag: 'abbr', body: wof['wof:abbreviation'] });

    // add 'ne:abbrev'
    // tokens.push({ lang: 'und', body: wof['ne:abbrev'] });

    // fields specific to countries & dependencies
    if( 'country' === doc.placetype || 'dependency' === doc.placetype ) {
      if( wof['iso:country'] && wof['iso:country'] !== 'XX' ){

        // add 'ne:iso_a2'
        tokens.push({ lang: 'und', tag: 'abbr', body: wof['ne:iso_a2'] });

        // add 'ne:iso_a3'
        tokens.push({ lang: 'und', tag: 'abbr', body: wof['ne:iso_a3'] });

        // add 'wof:country'
        // warning: eg. FR for 'French Guiana'
        // tokens.push({ lang: 'und', tag: 'abbr', body: wof['wof:country'] });

        // add 'iso:country'
        tokens.push({ lang: 'und', tag: 'abbr', body: wof['iso:country'] });

        // add 'wof:country_alpha3'
        tokens.push({ lang: 'und', tag: 'abbr', body: wof['wof:country_alpha3'] });
      }
    }

    // add 'name:*'
    for( var attr in wof ){
      // https://github.com/whosonfirst/whosonfirst-names
      // names: preferred|colloquial|variant|unknown
      var match = attr.match(/^name:([a-z]{3})_x_(preferred|colloquial|variant)$/);
      if( match ){

        // skip languages in the blacklist, see config file for more info
        if( language.blacklist.hasOwnProperty( match[1] ) ){ continue; }

        // index each alternative name
        for( var n in wof[ attr ] ){
          tokens.push({
            lang: match[1],
            tag: match[2],
            body: wof[ attr ][ n ]
          });
        }

        // doc - only store 'preferred' strings
        if( match[2] === 'preferred' ){
          doc.names[ match[1] ] = wof[ attr ];
        }
      }
    }
  }

  // In the USA we would like to favor the 'wof:label' property over the 'name:eng_x_preferred' property.
  if( 'US' === wof['iso:country'] && wof['wof:label'] ){
    doc.names.eng = [ wof['wof:label'] ];
  }

  // --- graph ---

  // parent_id property (some records have this property set but no hierarchy)
  var parentId;
  if( wof.hasOwnProperty('wof:parent_id') ){
    parentId = wof['wof:parent_id'];
    if( 'string' === typeof parentId ){ parentId = parseInt( parentId, 10 ); }
    if( !isNaN( parentId ) && parentId !== id && parentId > 0 ){
      parentIds.push( parentId ); // is child of
    }
  }

  // hierarchy properties
  for( var h in wof['wof:hierarchy'] ){
   for( var i in wof['wof:hierarchy'][h] ){
     var pid = wof['wof:hierarchy'][h][i];
     if( 'string' === typeof pid ){ pid = parseInt( pid, 10 ); }
     if( pid === id || pid <= 0 || pid === parentId ){ continue; }
     //  parentIds.push( id, pid, 'p' ); // has parent
     parentIds.push( pid ); // is child of
   }
  }

  // ---- consume aggregates

  // normalize tokens
  tokens = tokens.reduce(( res, token ) => {
    analysis.normalize( token.body ).forEach( norm => {
      res.push({ lang: token.lang, tag: token.tag, body: norm });
    });
    return res;
  }, []);

  // sort tokens (for optimal deduplication)
  tokens.sort((i1, i2) => {

    // sort by language
    const l1 = LANG_PREFS.indexOf(i1.lang);
    const l2 = LANG_PREFS.indexOf(i2.lang);

    if (l1 === -1){ return +1; }
    if (l2 === -1){ return -1; }
    if (l1 > l2){ return +1; }
    if (l1 < l2){ return -1; }

    // sort by tag
    const t1 = TAG_PREFS.indexOf(i1.tag);
    const t2 = TAG_PREFS.indexOf(i2.tag);

    if (t1 === -1){ return +1; }
    if (t2 === -1){ return -1; }
    if (t1 > t2){ return +1; }
    if (t1 < t2){ return -1; }

    return 0;
  });

  // deduplicate tokens
  var seen = {};
  tokens = tokens.filter( token => {
    if( seen.hasOwnProperty( 'eng:' + token.body ) ){ return false; }
    if( seen.hasOwnProperty( 'und:' + token.body ) ){ return false; }
    const key = token.lang + ':' + token.body;
    return seen.hasOwnProperty( key ) ? false : ( seen[ key ] = true );
  });

  // deduplicate parent ids
  parentIds = parentIds.filter(( pid, pos ) => {
    return parentIds.indexOf( pid ) === pos;
  });

  // save all data to the databases
  this.store.set( id, doc, ( err ) => {
    if( err ){ console.error( err ); }
    this.index.setTokens( id, tokens, ( err ) => {
      if( err ){ console.error( err ); }
      this.index.setLineage( id, parentIds, ( err ) => {
        if( err ){ console.error( err ); }
        next();
      });
    });
  });
}

// check if value is a valid number
function isFiniteNumber( value ){
  return !_.isEmpty(_.trim( value )) && _.isFinite(_.toNumber( value ));
}

function isValidWofRecord( id, wof ){

  // sanity check inputs
  if( !id || !wof ) { return false; }

  // sanity check; because WOF
  if( id <= 0 ) { return false; }

  // skip deprecated records
  const deprecated = _.trim( wof['edtf:deprecated'] );
  if( !_.isEmpty( deprecated ) && deprecated !== 'uuuu' ){
    return false;
  }

  // skip superseded records
  const superseded = wof['wof:superseded_by'];
  if( Array.isArray( superseded ) && superseded.length > 0 ){
    return false;
  }

  /**
    skip non-current records

    0 signifies a non-current record
    1 signifies a current record
    -1 signifies an inderminate state, someone needs to look at this record and decide

    note: we are considering -1 values as current (for now)
  **/
  const isCurrent = wof['mz:is_current'];
  if( isCurrent === '0' || isCurrent === 0 ){
    return false;
  }

  // invalid latitude
  if( !isFiniteNumber(wof['lbl:latitude']) && !isFiniteNumber(wof['geom:latitude']) ){
    return false;
  }

  // invalid longitude
  if( !isFiniteNumber(wof['lbl:longitude']) && !isFiniteNumber(wof['geom:longitude']) ){
    return false;
  }

  return true;
}

// this function favors mz:population when available, falling back to other properties.
// see: https://github.com/whosonfirst-data/whosonfirst-data/issues/240#issuecomment-294907374
function getPopulation( wof ) {
       if( wof['mz:population'] ){          return wof['mz:population']; }
  else if( wof['wof:population'] ){         return wof['wof:population']; }
  else if( wof['wk:population'] ){          return wof['wk:population']; }
  else if( wof['gn:population'] ){          return wof['gn:population']; }
  else if( wof['gn:pop'] ){                 return wof['gn:pop']; }
  else if( wof['qs:pop'] ){                 return wof['qs:pop']; }
  else if( wof['qs:gn_pop'] ){              return wof['qs:gn_pop']; }
  else if( wof['zs:pop10'] ){               return wof['zs:pop10']; }
  else if( wof['meso:pop'] ){               return wof['meso:pop']; }
  else if( wof['statoids:population'] ){    return wof['statoids:population']; }
  else if( wof['ne:pop_est'] ){             return wof['ne:pop_est']; }
}

// abbreviations and ISO codes
// logic copied from: pelias/whosonfirst src/components/extractFields.js (since modified)
function getAbbreviation( wof ) {
  if( 'country' === wof['wof:placetype'] || 'dependency' === wof['wof:placetype'] ) {
    return wof['wof:country_alpha3'] || wof['ne:iso_a3'];
  } else if( wof['wof:abbreviation'] ) {
    return wof['wof:abbreviation'];
  }
}

const PLACETYPE_RANK = [
  'venue', 'address', 'building', 'campus', 'microhood', 'neighbourhood', 'macrohood', 'borough', 'postalcode',
  'locality', 'metro area', 'localadmin', 'county', 'macrocounty', 'region', 'macroregion', 'marinearea',
  'disputed', 'dependency', 'country', 'empire', 'continent', 'ocean', 'planet'
];

// this function returns an integer representation of the placetype,
function getRank( placetype ){
  var rank = PLACETYPE_RANK.indexOf((placetype || '').toLowerCase().trim());
  return {
    min: rank,
    max: rank +1
  };
}

module.exports.insertWofRecord = insertWofRecord;
module.exports.isValidWofRecord = isValidWofRecord;
module.exports.getPopulation = getPopulation;
module.exports.getAbbreviation = getAbbreviation;
