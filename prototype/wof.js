
// plugin for whosonfirst
var analysis = require('../lib/analysis');

// insert a wof record in to index
module.exports.insertWofRecord = function( wof ){

  var id = wof['wof:id'];
  if( 'string' == typeof id ){ id = parseInt( id, 10 ); }

  // --- store ---
  // add doc to store
  var doc = {
    name: wof['wof:name'],
    placetype: wof['wof:placetype'],
    lineage: wof['wof:hierarchy'][0],
    names: {}
  };

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
    var match = attr.match(/^name:(.*)_x_(preferred|colloquial)$/);
    if( match ){
      for( var n in wof[ attr ] ){
        keys = analysis.normalize( wof[ attr ][ n ] );
        for( k=0; k<keys.length; k++ ){
          this.graph.addToken( id, keys[k] );
        }
      }
      // doc
      // doc.names[ match[1] + '_x_' + match[2] ] = wof[ attr ];
    }
  }

  // --- store ---
  // add doc to store
  this.store.set( id, doc );

  // --- graph ---
  for( var h in wof['wof:hierarchy'] ){
   for( var i in wof['wof:hierarchy'][h] ){
     pid = wof['wof:hierarchy'][h][i];
     if( 'string' == typeof pid ){ pid = parseInt( pid, 10 ); }
     if( pid === id ){ continue; }
     //  this.graph.setEdge( id, pid, 'p' ); // has parent
     this.graph.setEdge( pid, id ); // is child of
   }
  }

};
