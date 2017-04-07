
var split = require('split2'),
    through = require('through2'),
    parse = require('../lib/parse'),
    Placeholder = require('../Placeholder'),
    ph = new Placeholder();

ph.load(); // load data from disk

var order = [
  'venue', 'address', 'building', 'campus', 'microhood', 'neighbourhood', 'macrohood', 'burough', 'postalcode',
  'locality', 'metro area', 'localadmin', 'county', 'macrocounty', 'region', 'macroregion', 'country', 'empire', 'continent', 'ocean', 'planet'
];

// run test generation pipeline
process.stdin.pipe( split() )
             .pipe( parse() )
             .pipe( through.obj( function insert( wof, _, next ){

              var id = wof['wof:id'];
              if( 'string' == typeof id ){ id = parseInt( id, 10 ); }

              for( var h in wof['wof:hierarchy'] ){

                var line = [ id, wof['wof:name'] ];

                // collect all parent ids for this hierarchy
                var parentIds = [];
                for( var o=0; o<order.length; o++ ){
                  var placetype_id = order[o]+ '_id';
                  var pid = wof['wof:hierarchy'][h][placetype_id];
                  if( pid && pid !== id && pid > 0 ){
                    if( 'string' == typeof pid ){ pid = parseInt( pid, 10 ); }

                    var parent = ph.store.get( pid );
                    if( !parent ){
                      console.error( 'parent record of %s not found: %s', id, pid );
                      continue;
                    }
                    line.push( parent.name );
                  }
                }

                console.log( line.join(' ') );
              }

               next();
             }));
