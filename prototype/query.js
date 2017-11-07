
var async = require('async');
var util = require('util');
var Result = require('../lib/Result');
var sorted = require('../lib/sorted');

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

// query a single group
function queryGroup( index, group, done ){

  // handle empty group
  if( !group || group.length <= 0 ){
    console.error( 'group length <= 0' );
    return done( null, [], [], [] );
  }

  // handle single token groups
  if( 1 === group.length ){
    index.matchSubjectDistinctSubjectIds( group[ 0 ], ( err, rows ) => {

      if( err || !rows || !rows.length ){
        return done( err, [], [], group );
      }

      const res = new Result( group );
      res.ids = Result.subjectIdsFromRows( rows );
      res.done = done;

      reduce( index, res );
    });
  }
  // handle multiple token groups
  else {

    const res = new Result( group );
    res.done = done;

    reduce( index, res );
  }
}

// query many groups & merge the result
function queryManyGroups( index, groups, done ){

  // query each group in parallel
  // note: parallel likely doesn't have much of a perf gain when
  // using 'npm better-sqlite3'.
  async.parallel( groups.map( group => cb => {
    queryGroup( index, group, ( err, ids, mask, group ) => {
      cb( null, { err: err, ids: ids, mask: mask, group: group });
    });
  }), function mergeQueryGroupResults( err, res ) {

    var mergedIds = [];
    const masks = [];
    const groups = [];
    res.forEach( r => {
      if( r.err ){ return; }
      if( Array.isArray( r.ids ) ){
        mergedIds = sorted.merge( mergedIds, r.ids );
      }
      masks.push( r.mask );
      groups.push( r.group );
    });

    // @todo find a way of returning all masks/groups
    // instead of only the first element
    return done( err, mergedIds, masks[0], groups[0] );
  });
}

function query( text, done ){
  this.tokenize( text, function( err, groups ){

    switch( groups.length ){

      // in a failure case we didnt find any groups; abort now
      case 0: return done( null, [], [], [] );

      // in most cases there is only one group to query
      case 1: return queryGroup( this.index, groups[0], done );

      // for queries with multiple groups, we query each
      // group and then merge the results together.
      default: return queryManyGroups( this.index, groups, done );
    }

  }.bind(this));
}

module.exports.query = query;
