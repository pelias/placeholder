
var split = require('split2'),
    through = require('through2'),
    parser = require('../lib/jsonParseStream'),
    Placeholder = require('../Placeholder'),
    ph = new Placeholder();

ph.load(); // load data from disk

var order = [
  'venue',
  'address',
  'building',
  'campus',
  'microhood',
  'neighbourhood',
  'macrohood',
  'burough',
  'postalcode',
  'locality',
  'metro area',
  'localadmin',
  'county',
  'macrocounty',
  'region',
  'macroregion',
  'country',
  'empire',
  'continent',
  'ocean',
  'planet'
];

// run test generation pipeline
process.stdin.pipe( split() )
             .pipe( parser() )
             .pipe( through.obj( function insert( wof, _, next ){

              var id = wof['wof:id'];
              if( 'string' === typeof id ){ id = parseInt( id, 10 ); }

              // sanity check; because WOF
              if( !ph.isValidWofRecord( id, wof ) ) { return next(); }

              // console.error( wof );

              for( var h in wof['wof:hierarchy'] ){

                // collect all parent ids for this hierarchy
                var parentIds = [];
                for( var o=0; o<order.length; o++ ){
                  var placetype_id = order[o]+ '_id';
                  var pid = wof['wof:hierarchy'][h][placetype_id];
                  if( pid && pid !== id && pid > 0 ){
                    if( 'string' === typeof pid ){ pid = parseInt( pid, 10 ); }
                    parentIds.push( pid );
                  }
                }

                print( ph, [ id, wof['wof:name'] ], parentIds );
              }

               next();
             }));

function print( ph, line, parentIds ){
  ph.store.getMany( parentIds, function( err, parents ){

    if( err || !Array.isArray( parents ) || !parents.length ){
      console.error( 'an error occurred', err, parents );
      return;
    }

    var parentMap = {};
    parents.forEach( function( parent ){
      parentMap[ parent.id ] = parent;
    });

    parentIds.forEach( function( pid ){
      if( !parentMap.hasOwnProperty( pid ) ){
        console.error( 'parent record of %s not found: %s', line[0], pid );
        return;
      }
      line.push( parentMap[pid].name );
    });

    console.log( line.join(' ') );
  });
}
