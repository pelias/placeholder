
var async = require('async');
var util = require('util');
// var sorted = require('../lib/sorted');

var debug = true;

function query( db, tokenize, text, done ){

  console.time('tokenize');

  var tokens = tokenize( text, function( err, groups ){

    console.timeEnd('tokenize');
    console.error( groups );

    var group = groups[0];

    // handle group lengths
    if( !group || group.length <= 0 ){
      console.error( 'group length <= 0' );
      return done( null, [], [], [] );
    }
    // else if( group.length === 1 ){
    //   group.push( '' );
    // }

    function reduceRight( res, mask, group, pos, cb ){

      // initialize pos
      if( null === pos ){
        pos = {
          subject: group.length -2,
          object: group.length -1
        };
      }

      // reset indicates if we failed to find any matches for
      // object with any of the subjects
      // in this case we will use the previous object value
      // as a 'seed' for the id pool
      var reset = false;
      var prevObject = null;

      // check if we are done
      if( -1 === pos.subject ){
        if( pos.object <= 1 ){

          if( 0 === res.length ){
            return db.matchSubject( group[ 0 ], ( err, states ) => {
              var subjectIds = states.map( state => { return state.subjectId; } );
              return cb( null, subjectIds, [], group );
            });
          }

          return cb( null, res, mask, group );
        }

        // reset
        reset = true;
        prevObject = group[ pos.object ];

        // more values to try (do a reset)
        pos.object--;
        pos.subject = pos.object-1;
      }

      var subject = group[ pos.subject ];
      var object = group[ pos.object ];

      var isObjectLastToken = ( pos.object === group.length -1 );

      if( reset ){ console.error( 'RESET!!' ); }
      if( debug ){
        console.log( '---------------------------------------------------' );
        // console.log( 'subject', subject );
        // console.log( 'object', object );
        console.log( util.format( '"%s" >>> "%s"', subject, object ) );
      }

      var next = function( err, states ){

        if( debug ){
          console.log('found (' + states.length + '):');
          console.log( states.map( state => {
            return ' - ' + util.format(
              '"%s" (%d) >>> "%s" (%d)',
              state.subject,
              state.subjectId,
              state.object,
              state.objectId
            );
          }).join('\n'));
        }

        if( !err && states.length ){
          var subjectIds = states.map( state => { return state.subjectId; } );

          if( !res.length ){
            // first match
            res = subjectIds;
            pos.object--;
            pos.subject = pos.object;
            mask.unshift( subjectIds.length );
          } else {

            var matches = [];
            states.forEach( state => {
              // console.error( 'state', state );
              if( -1 !== res.indexOf( state.objectId ) ){
                matches.push( state.subjectId );
              }
            });

            if( matches.length >= 1 ){
              res = matches;
              pos.object--;
              pos.subject = pos.object;
              mask.unshift( matches.length );
            } else {
              console.error( 'failed!' );
              mask.unshift( 0 );
            }
          }
        } else {
          mask.unshift( 0 );
        }

        pos.subject--;
        if( debug ){ console.error( 'res', res ); }
        reduceRight( res, mask, group, pos, cb );
      };

      // autocomplete last word
      if( isObjectLastToken ){
        db.matchSubjectObjectAutocomplete( subject, object, next);
      }
      else if( reset ){
        db.matchSubject( prevObject, next );
      }
      else {
        db.matchSubjectObject( subject, object, next);
      }
    }

    // console.log( group.reverse() );

    // handle single token groups
    if( 1 === group.length ){
      db.matchSubjectAutocomplete( group[ 0 ], ( err, states ) => {

        if( err || !states || !states.length ){
          return done( err, [], [], group );
        }

        var ids = states.map( state => { return state.subjectId; } );
        // return done( null, ids, [ ids.length ], group );

        reduceRight( ids, [], group, null, done );
      });
    }
    else {
      reduceRight( [], [], group, null, done );
    }

    // else {
    //   console.time('starting set');
    //   var res = [];
    //
    //   var foo = group.slice().reverse();
    //   // foo.shift();
    //
    //   async.detectSeries( foo, ( subject, cb ) => {
    //     db.matchSubject( subject, ( err, states ) => {
    //       if( !err && states && states.length ){
    //         res = states.map( state => { return state.subjectId; } );
    //         return cb( null, true );
    //       }
    //       cb( null, false );
    //     });
    //   }, ( err, foo ) => {
    //     console.timeEnd('starting set');
    //     console.error( 'starting with', res.length );
    //     // console.error( err, foo );
    //     reduceRight( res, [], group, null, done );
    //   });
    // }
  });
}

module.exports.query = query;
