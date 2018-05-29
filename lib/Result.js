
const util = require('util');
const DEBUG = false;

// convenience function for debugging
function _debugRows( rows ){
  rows = rows || [];
  console.log('found (' + rows.length + '):');
  console.log( rows.map( row => {
    return ' - ' + util.format(
      '"%s" (%d) >>> "%s" (%d)',
      row.subject,
      row.subjectId,
      row.object,
      row.objectId
    );
  }).join('\n'));
}

  // reset indicates if we failed to find any matches for
  // object with any of the subjects
  // in this case we will use the previous object value
  // as a 'seed' for the id pool

function Result( group, done ){
  this.group = Array.isArray( group ) ? group : [];
  this.ids = {};
  this.mask = new Array( this.group.length ).fill( false );
  this.pos = {
    subject: this.group.length -2,
    object: this.group.length -1
  };
  this.reset = false;
  this.done = ('function' === typeof done) ? done : function(){};
}

Result.prototype.getSubject = function(){
  return this.group[ this.pos.subject ];
};

Result.prototype.getObject = function(){
  return this.group[ this.pos.object ];
};

Result.prototype.getPreviousObject = function(){
  return this.group[ this.pos.prev_object ];
};

Result.prototype.getIdsAsArray = function(){
  return Object.keys( this.ids ).map( k => parseInt( k, 10 ) );
};

// return all the 'subjectId' values from rows returned from the db
// optionally: use a function to filter which rows are included.
Result.subjectIdsFromRows = function( rows, filter ){
  return rows.reduce(( memo, row ) => {
    if( 'function' === typeof filter ){
      if( !filter( row ) ){ return memo; }
    }
    if( row.hasOwnProperty('subjectId') ){
      memo[ row.subjectId ] = true;
    }
    return memo;
  }, {});
};

// convenience function to set mask values
Result.prototype.setMask = function( entity, bool ){
  if( this.pos.hasOwnProperty(entity) && -1 < this.pos[entity] ){
    this.mask[ this.pos[entity] ] = !!bool;
  }
};

// intersect the currect resultset with new matching rows from
// the database.
Result.prototype.intersect = function( err, rows ){

  // debugging
  if( DEBUG ){ _debugRows( rows ); }

  // no results were found
  if( err || !rows || !rows.length ){

    // decrement iterator
    this.pos.subject--;
    return;
  }

  // first time we have found matching rows for the query
  if( !Object.keys( this.ids ).length ){
    this.ids = Result.subjectIdsFromRows( rows );
    this.setMask('object', true);
    this.setMask('subject', true);
    this.pos.object = this.pos.subject;
    this.pos.subject = this.pos.object-1;
    return;
  }

  // compute the intersection of the new rows and the past
  // matched ids.

  // find the results which are children of existing ids
  const children = Result.subjectIdsFromRows(
    rows,
    row => this.ids.hasOwnProperty( row.objectId )
  );

  // we found at least one valid child
  if( !!Object.keys( children ).length ){
    this.ids = children;
    this.setMask('subject', true);
    this.pos.object = this.pos.subject;
    this.pos.subject = this.pos.object-1;
    return;
  }

  // we failed to find any valid children of existing ids
  if( DEBUG ){ console.error( 'failed!' ); }

  // decrement iterator
  this.pos.subject--;
};

module.exports = Result;
