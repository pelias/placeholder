
// plugin for whosonfirst
var _ = require('lodash'),
    dir = require('require-dir'),
    analysis = require('../lib/analysis'),
    language = dir('../config/language');

// insert a wof record in to index
function insertWofRecord( wof, next ){

  var id = wof['wof:id'];
  if( 'string' === typeof id ){ id = parseInt( id, 10 ); }

  // sanity check; because WOF
  if( !isValidWofRecord( id, wof ) ) { return next(); }

  // --- document which will be saved in the doc store ---

  var doc = {
    id: id,
    name: wof['wof:label'] || wof['wof:name'],
    abbr: getAbbreviation( wof ),
    placetype: wof['wof:placetype'],
    population: getPopulation( wof ),
    popularity: wof['misc:photo_sum'],
    lineage: wof['wof:hierarchy'],
    geom: {
      area: wof['geom:area'],
      bbox: wof['lbl:bbox'] || wof['geom:bbox'],
      lat: wof['lbl:latitude'] || wof['geom:latitude'],
      lon: wof['lbl:longitude'] ||wof['geom:longitude']
    },
    names: {},
    tokens: [],
    parentIds: []
  };

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
    doc.tokens.push( wof['wof:label'] );

    // add 'wof:name'
    doc.tokens.push( wof['wof:name'] );

    // add 'wof:abbreviation'
    doc.tokens.push( wof['wof:abbreviation'] );

    // add 'ne:abbrev'
    // doc.tokens.push( wof['ne:abbrev'] );

    // fields specific to countries & dependencies
    if( 'country' === doc.placetype || 'dependency' === doc.placetype ) {
      if( wof['iso:country'] && wof['iso:country'] !== 'XX' ){

        // add 'ne:iso_a2'
        doc.tokens.push( wof['ne:iso_a2'] );

        // add 'ne:iso_a3'
        doc.tokens.push( wof['ne:iso_a3'] );

        // add 'wof:country'
        // warning: eg. FR for 'French Guiana'
        // doc.tokens.push( wof['wof:country'] );

        // add 'iso:country'
        doc.tokens.push( wof['iso:country'] );

        // add 'wof:country_alpha3'
        doc.tokens.push( wof['wof:country_alpha3'] );
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
          doc.tokens.push( wof[ attr ][ n ] );
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
      doc.parentIds.push( parentId ); // is child of
    }
  }

  // hierarchy properties
  for( var h in wof['wof:hierarchy'] ){
   for( var i in wof['wof:hierarchy'][h] ){
     var pid = wof['wof:hierarchy'][h][i];
     if( 'string' === typeof pid ){ pid = parseInt( pid, 10 ); }
     if( pid === id || pid <= 0 || pid === parentId ){ continue; }
     //  doc.parentIds.push( id, pid, 'p' ); // has parent
     doc.parentIds.push( pid ); // is child of
   }
  }

  // ---- consume aggregates

  // normalize tokens
  doc.tokens = doc.tokens.reduce(( res, token ) => {
    analysis.normalize( token ).forEach( norm => {
      res.push( norm );
    });
    return res;
  }, []);

  // deduplicate tokens
  doc.tokens = doc.tokens.filter(( token, pos ) => {
    return doc.tokens.indexOf( token ) === pos;
  });

  // store tokens in graph
  doc.tokens.forEach(token => {
    this.graph.addToken( doc.id, token );
  }, this);

  // deduplicate parent ids
  doc.parentIds = doc.parentIds.filter(( pid, pos ) => {
    return doc.parentIds.indexOf( pid ) === pos;
  });

  // store parent ids
  doc.parentIds.forEach(pid => {
    this.graph.setEdge( pid, doc.id );
  }, this);

  // --- store ---
  // add doc to store

  var tokens = doc.tokens;
  var parentIds = doc.parentIds;
  
  // --- delete fields
  delete doc.tokens;
  delete doc.parentIds;

  this.store.set( id, doc, () => {
    this.store.setTokens( id, tokens, () => {
      this.store.setLineage( id, parentIds, next );
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
  var deprecated = _.trim( wof['edtf:deprecated'] );
  if( !_.isEmpty( deprecated ) && deprecated !== 'uuuu' ){
    return false;
  }

  // skip superseded records
  var superseded = wof['wof:superseded_by'];
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
  var isCurrent = wof['mz:is_current'];
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

module.exports.insertWofRecord = insertWofRecord;
module.exports.isValidWofRecord = isValidWofRecord;
module.exports.getPopulation = getPopulation;
module.exports.getAbbreviation = getAbbreviation;
