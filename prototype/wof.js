
// plugin for whosonfirst
var _ = require('lodash'),
    analysis = require('../lib/analysis');

// insert a wof record in to index
module.exports.insertWofRecord = function( wof, next ){

  var id = wof['wof:id'];
  if( 'string' == typeof id ){ id = parseInt( id, 10 ); }

  // sanity check; because WOF
  if( !this.isValidWofRecord( id, wof ) ) { return next(); }

  // --- store ---
  // add doc to store
  var doc = {
    id: id,
    name: wof['wof:name'],
    abbr: undefined,
    placetype: wof['wof:placetype'],
    lineage: wof['wof:hierarchy'],
    geom: {
      area: wof['geom:area'],
      bbox: wof['geom:bbox'],
      lat: wof['geom:latitude'],
      lon: wof['geom:longitude']
    },
    names: {}
  };

  // --- abbreviations and ISO codes ---

  if( -1 !== ['dependency','country'].indexOf( doc.placetype ) ) {
    doc.abbr = wof['wof:country_alpha3'];
  } else if( wof['wof:abbreviation'] ) {
    doc.abbr = wof['wof:abbreviation'];
  }

  // --- tokens ---

  // add 'wof:name'
  var keys = analysis.normalize( wof['wof:name'] );
  for( var k=0; k<keys.length; k++ ){
    this.graph.addToken( id, keys[k] );
  }

  // add 'wof:abbreviation'
  keys = analysis.normalize( wof['wof:abbreviation'] );
  for( k=0; k<keys.length; k++ ){
    this.graph.addToken( id, keys[k] );
  }

  // add 'ne:abbrev'
  // keys = analysis.normalize( wof['ne:abbrev'] );
  // for( k=0; k<keys.length; k++ ){
  //   this.graph.addToken( id, keys[k] );
  // }

  // fields precific to countries
  if( wof['wof:placetype'] === 'country' ){
    if( wof['iso:country'] && wof['iso:country'] !== 'XX' ){

      // add 'ne:iso_a2'
      keys = analysis.normalize( wof['ne:iso_a2'] );
      for( k=0; k<keys.length; k++ ){
        this.graph.addToken( id, keys[k] );
      }

      // add 'ne:iso_a3'
      keys = analysis.normalize( wof['ne:iso_a3'] );
      for( k=0; k<keys.length; k++ ){
        this.graph.addToken( id, keys[k] );
      }

      // add 'wof:country'
      // warning: eg. FR for 'French Guiana'
      // keys = analysis.normalize( wof['wof:country'] );
      // for( k=0; k<keys.length; k++ ){
      //   this.graph.addToken( id, keys[k] );
      // }

      // add 'iso:country'
      keys = analysis.normalize( wof['iso:country'] );
      for( k=0; k<keys.length; k++ ){
        this.graph.addToken( id, keys[k] );
      }

      // add 'wof:country_alpha3'
      keys = analysis.normalize( wof['wof:country_alpha3'] );
      for( k=0; k<keys.length; k++ ){
        this.graph.addToken( id, keys[k] );
      }
    }
  }

  // add 'name:*'
  for( var attr in wof ){
    // https://github.com/whosonfirst/whosonfirst-names
    // names: preferred|colloquial|variant|unknown
    var match = attr.match(/^name:(.*)_x_(preferred|colloquial|variant)$/);
    if( match ){
      for( var n in wof[ attr ] ){
        keys = analysis.normalize( wof[ attr ][ n ] );
        for( k=0; k<keys.length; k++ ){
          this.graph.addToken( id, keys[k] );
        }
      }
      // doc - only store 'preferred' strings
      if( match[2] === 'preferred' ){
        doc.names[ match[1] ] = wof[ attr ];
      }
    }
  }

  // --- graph ---
  for( var h in wof['wof:hierarchy'] ){
   for( var i in wof['wof:hierarchy'][h] ){
     pid = wof['wof:hierarchy'][h][i];
     if( 'string' == typeof pid ){ pid = parseInt( pid, 10 ); }
     if( pid === id || pid <= 0 ){ continue; }
     //  this.graph.setEdge( id, pid, 'p' ); // has parent
     this.graph.setEdge( pid, id ); // is child of
   }
  }

  // --- store ---
  // add doc to store
  this.store.set( id, doc, next );

};

module.exports.isValidWofRecord = function( id, wof ){

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
};
