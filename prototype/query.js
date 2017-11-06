
var async = require('async');
var util = require('util');
var Result = require('../lib/Result');

var debug = false;

function reduce( index, res ){

  // we are on the last subject for this iteration
  if( -1 === res.pos.subject ){

    // we still have more object tokens to try
    // so we reset the iterators.
    if( res.pos.object > 1 ){

      // reset (move on to the next object)
      res.reset = true;

      // we have more values to try, update the positions
      // move on to the next object and start checking subjects to its left
      res.pos.prev_object = res.pos.object;
      res.pos.object--;
      res.pos.subject = res.pos.object-1;
    }

    // we have run out of tokens (all object tokens used up)
    else {

      // convert the internal hashmap to a sorted array of integers
      const idsArray = res.getIdsAsArray();

      // we didn't match anything, so simply return the ids for
      // the rightmost token.
      if( !idsArray.length ){
        return index.matchSubjectDistinctSubjectIds( res.group[ 1 ], ( err, rows ) => {
          const subjectIds = rows.map( row => { return row.subjectId; } );
          return res.done( null, subjectIds, [], res.group );
        });
      }

      // we are done, return the result
      return res.done( null, idsArray, res.mask, res.group );
    }
  }

  if( debug && res.reset ){ console.error( 'RESET!!' ); }
  if( debug ){
    console.log( '---------------------------------------------------' );
    console.log( util.format( '"%s" >>> "%s"', res.getSubject(), res.getObject() ) );
  }

  // reset
  if( res.reset ){
    res.reset = false; // return to default value
    index.matchSubjectDistinctSubjectIds( res.getPreviousObject(), (err, rows) => {
      res.intersect( err, rows );
      reduce( index, res );
    });
  }
  // regular
  else {
    index.matchSubjectObject( res.getSubject(), res.getObject(), (err, rows) => {
      res.intersect( err, rows );
      reduce( index, res );
    });
  }
}

function query( text, done ){
  this.tokenize( text, function( err, groups ){

    // @todo: handle multiple groups?
    const group = groups[0];

    // handle empty group
    if( !group || group.length <= 0 ){
      console.error( 'group length <= 0' );
      return done( null, [], [], [] );
    }

    // handle single token groups
    if( 1 === group.length ){
      this.index.matchSubjectDistinctSubjectIds( group[ 0 ], ( err, rows ) => {

        if( err || !rows || !rows.length ){
          return done( err, [], [], group );
        }

        const res = new Result( group );
        res.ids = Result.subjectIdsFromRows( rows );
        res.done = done;

        reduce( this.index, res );
      });
    }
    // handle multiple token groups
    else {

      const res = new Result( group );
      res.done = done;

      reduce( this.index, res );
    }
  }.bind(this));
}

module.exports.query = query;
