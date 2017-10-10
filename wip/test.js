
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

var debug = false;

// var text = 'Example Street Neutral Bay North Sydney New South Wales 9999 AU';
// var text = '123 apple bay ave neutral bay north sydney rome new south wales au';
// var text = 'paris fr';
var text = ( process.argv.length > 2 ) ? process.argv.slice(2).join(' ') : 'test string';

console.time('tokenize');
console.time('total');
var tokens = tokenize( text, function( err, groups ){

  console.timeEnd('tokenize');
  console.error( groups );

  var group = groups[0];

  // handle group lengths
  if( group.length <= 0 ){
    console.error( 'group length <= 0' );
    return [];
  }
  else if( group.length === 1 ){
    group.push( '' );
  }


  function reduceRight( res, mask, group, pos, cb ){

    // initialize pos
    if( null === pos ){
      pos = {
        subject: group.length -2,
        object: group.length -1
      };
    }

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

    // var isObjectLastToken = ( pos.object === group.length -1 );

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
          return ' - ' + state.fmtString();
        }).join('\n'));
      }

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
      if( debug ){ console.error( 'res', res ); }
      reduceRight( res, mask, group, pos, cb );
    };

    // autocomplete last word
    // if( isObjectLastToken ){
    //   db.matchSubjectObjectAutocomplete( subject, object, next);
    // }
    // else {
      db.matchSubjectObject( subject, object, next);
    // }
  }

  reduceRight( [], [], group, null, ( err, windows, mask ) => {
    console.log( '===================================================' );
    console.timeEnd('total');
    if( err ){ console.error( err ); }
    if( debug ){ console.error( 'results', windows ); }
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
});
