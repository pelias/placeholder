
// plugin for whosonfirst
var _ = require('lodash'),
    analysis = require('../lib/analysis');

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
    lineage: wof['wof:hierarchy'],
    geom: {
      area: wof['geom:area'],
      bbox: wof['lbl:bbox'] || wof['geom:bbox'],
      lat: wof['lbl:latitude'] || wof['geom:latitude'],
      lon: wof['lbl:longitude'] ||wof['geom:longitude']
    },
    names: {}
  };

  // --- tokens ---

  // convenience function with $id bound as first argument
  var addToken = this.graph.addToken.bind( this.graph, id );

  // add 'wof:label'
  analysis.normalize( wof['wof:label'] ).forEach( addToken );

  // add 'wof:name'
  analysis.normalize( wof['wof:name'] ).forEach( addToken );

  // add 'wof:abbreviation'
  analysis.normalize( wof['wof:abbreviation'] ).forEach( addToken );

  // add 'ne:abbrev'
  // analysis.normalize( wof['ne:abbrev'] ).forEach( addToken );

  // fields specific to countries & dependencies
  if( 'country' === doc.placetype || 'dependency' === doc.placetype ) {
    if( wof['iso:country'] && wof['iso:country'] !== 'XX' ){

      // add 'ne:iso_a2'
      analysis.normalize( wof['ne:iso_a2'] ).forEach( addToken );

      // add 'ne:iso_a3'
      analysis.normalize( wof['ne:iso_a3'] ).forEach( addToken );

      // add 'wof:country'
      // warning: eg. FR for 'French Guiana'
      // analysis.normalize( wof['wof:country'] ).forEach( addToken );

      // add 'iso:country'
      analysis.normalize( wof['iso:country'] ).forEach( addToken );

      // add 'wof:country_alpha3'
      analysis.normalize( wof['wof:country_alpha3'] ).forEach( addToken );
    }
  }

  // add 'name:*'
  for( var attr in wof ){
    // https://github.com/whosonfirst/whosonfirst-names
    // names: preferred|colloquial|variant|unknown
    var match = attr.match(/^name:(.*)_x_(preferred|colloquial|variant)$/);
    if( match ){
      for( var n in wof[ attr ] ){
        analysis.normalize( wof[ attr ][ n ] ).forEach( addToken );
      }
      // doc - only store 'preferred' strings
      if( match[2] === 'preferred' ){
        doc.names[ match[1] ] = wof[ attr ];
      }
    }
  }

  // In the USA we would like to favor the 'wof:label' property over the 'name:eng_x_preferred' property.
  if( 'US' === wof['wof:country'] && wof['wof:label'] ){
    doc.names.eng = [ wof['wof:label'] ];
  }

  // --- graph ---
  for( var h in wof['wof:hierarchy'] ){
   for( var i in wof['wof:hierarchy'][h] ){
     var pid = wof['wof:hierarchy'][h][i];
     if( 'string' === typeof pid ){ pid = parseInt( pid, 10 ); }
     if( pid === id || pid <= 0 ){ continue; }
     //  this.graph.setEdge( id, pid, 'p' ); // has parent
     this.graph.setEdge( pid, id ); // is child of
   }
  }

  // --- store ---
  // add doc to store
  this.store.set( id, doc, next );

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

  // skip non-current records
  var isCurrent = wof['mz:is_current'];
  if( isCurrent === '0' || isCurrent === 0 ){
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
// logic copied from: pelias/whosonfirst src/components/extractFields.js
function getAbbreviation( wof ) {
  if( 'country' === wof['wof:placetype'] || 'dependency' === wof['wof:placetype'] ) {
    return wof['wof:country_alpha3'];
  } else if( wof['wof:abbreviation'] ) {
    return wof['wof:abbreviation'];
  }
}

module.exports.insertWofRecord = insertWofRecord;
module.exports.isValidWofRecord = isValidWofRecord;
module.exports.getPopulation = getPopulation;
module.exports.getAbbreviation = getAbbreviation;
