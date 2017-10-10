
var async = require('async');
var util = require('util');
var sorted = require('../lib/sorted');
var DocStore = require('../lib/DocStore');
var Database = require('./Database');

var db = new Database('./db' );
var store = new DocStore('./db' );
store.open('./data/store.sqlite3');

var tokenize = require('./test_tokenize').tokenize.bind({
  graph: { hasToken: db.hasSubject.bind( db ) }
});

// var text = 'Example Street Neutral Bay North Sydney New South Wales 9999 AU';
var text = '123 apple bay ave neutral bay north sydney rome new south wales au';

console.time('tokenize');
console.time('total');
var tokens = tokenize( text, function( err, groups ){

  console.timeEnd('tokenize');
  console.error( groups );

  var group = groups[0];

  // handle group lengths
  if( group.length <= 1 ){
    console.error( 'group length <= 1' );
    return [];
  }
  // else if( group.length === 1 ){
  //   group.unshift( '' );
  // }


  function reduceRight( res, mask, group, pos, cb ){

    // check if we are done
    if( -1 === pos.subject ){
      if( pos.object <= 1 ){
        return cb( null, res, mask );
      }

      // more values to try
      pos.object--;
      pos.subject = pos.object-1;
    }

    var subject = group[ pos.subject ];
    var object = group[ pos.object ];

    console.log( '---------------------------------------------------' );
    // console.log( 'subject', subject );
    // console.log( 'object', object );
    console.log( util.format( '"%s" >>> "%s"', subject, object ) );

    db.matchSubjectObject( subject, object, function( err, states ){

      console.log('found (' + states.length + '):');
      console.log( states.map( state => {
        return ' - ' + state.fmtString();
      }).join('\n'));

      if( !err && states.length ){
        var subjectIds = states.map( state => { return state.subjectId; } );

        if( !res.length ){
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

          if( matches.length > 1 ){
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
      console.error( 'res', res );
      reduceRight( res, mask, group, pos, cb );
    });
  }

  reduceRight( [], [], group, {
    subject: group.length -2,
    object: group.length -1
  }, ( err, windows, mask ) => {
    console.log( '===================================================' );
    console.timeEnd('total');
    if( err ){ console.error( err ); }
    console.error( 'results', windows );
    console.error( 'group', group );
    console.error( 'mask', mask );
    console.log( '===================================================' );
    store.getMany( windows, function( err, docs ){
      if( err ){ return console.error( err ); }
      docs.forEach( function( doc ){
        console.log( ' -', [ doc.id, doc.placetype + ' ', doc.name ].join('\t') );
      });
      console.log( '===================================================' );
    });
  });

  // var pos = group.length -1;
  //
  // async.reduceRight( group, [], ( memo, item, callback ) => {
  //   console.log( memo, Array.isArray( memo ), item );
  //   memo.push( item );
  //   callback( null, memo );
  //
  //   //
  //   // var subject =
  //   // var object =
  //   //
  //   // db.matchSubjectObject( group, function( err, states ){
  //
  // }, function( err, windows ){
  //   console.error( err );
  //   console.error( 'windows', windows );
  // });

  // while( pos > 0 ){
  //   windows.push( [ group[ pos -1 ], group[ pos ] ] );
  //   pos--;
  // }

  // console.log( 'windows', windows );

  //
  // intersectMultiple( groups[0], function( err, ids ){
  //
  //   console.error( ids );
  //
  //   var workingSet = [];
  //
  //   var idGroup = ids.pop();
  //   var firstToken = true;
  //
  //   while( idGroup ){
  //
  //     if( idGroup.length ){
  //       if( firstToken ){
  //         workingSet = idGroup;
  //       } else {
  //         // console.log( 'intersect' );
  //         var t = sorted.intersect([ idGroup, workingSet ]);
  //
  //         if( t.length ){
  //           workingSet = t;
  //         }
  //       }
  //     } else {
  //       return workingSet;
  //     }
  //
  //     idGroup = ids.pop();
  //     firstToken = false;
  //   }
  //
  //   console.error( workingSet );
  // });
});

// function intersectMultiple( groups, cb ){
//   async.map( groups, function( group, done ){
//     db.matchSubject( group, function( err, states ){
//
//       // console.log( states );
//
//       // console.error( group, states );
//       // cb( null );
//       done( err, sorted.unique( sorted.sort( states.map( state => { return state.id; } )) ));
//     });
//   }, cb);
// }
