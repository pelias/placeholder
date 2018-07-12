
// load SQL queries from filesystem
const query = require('../query/index');
const PARTIAL_TOKEN_SUFFIX = require('./analysis').PARTIAL_TOKEN_SUFFIX;
const REMOVE_PARTIAL_TOKEN_REGEX = new RegExp(PARTIAL_TOKEN_SUFFIX, 'g');
const MAX_RESULTS = 100;
const DEBUG = false;

// set threshold bounds between 0.0-1.0 (degrees), defaults to 0.2
const RTREE_ENV = parseFloat( process.env.RTREE_THRESHOLD );
const RTREE_THRESHOLD = !isNaN( RTREE_ENV ) ? Math.max( 0, Math.min( 1, RTREE_ENV ) ) : 0.2;

function debug( stmt, args, cb ){
  if( !DEBUG ){ return cb; }
  var query = renderQuery( stmt, args );
  var start = new Date().getTime();
  return function() {
    var took = new Date().getTime() - start;
    console.error('\x1b[1m' + query + '\x1b[0m');
    console.error('\x1b[1;93mtook', took + 'ms\x1b[0m');
    console.error('---------------------------------------------------------');
    cb.apply( null, Array.prototype.slice.call( arguments ) );
  };
}

// debug statement and args
function renderQuery( stmt, args ){
  var output = stmt.source;
  Object.keys( args ).forEach( key => {
    output = output.replace('$' + key, '\'' + args[ key ] + '\'');
  });
  return output;
}

// generic boolean query
module.exports._queryBool = function( stmt, args, cb ){
  cb = debug( stmt, args, cb );
  try {
    var row = stmt.get( args );
    return cb( undefined !== row );
  } catch ( err ){
    console.error( err );
    return cb( false );
  }
};

// generic all query
module.exports._queryAll = function( stmt, args, cb ){
  cb = debug( stmt, args, cb );
  try {
    var rows = stmt.all( args );
    if( !Array.isArray( rows ) ){ return cb( null, [] ); }
    return cb( null, rows );
  } catch ( err ){
    console.error( err );
    return cb( err );
  }
};

// cb( bool ) whether a 'subject' value exists in the db
module.exports.hasSubject = function( subject, cb ){
  var isPartialToken = subject.slice(-1) === PARTIAL_TOKEN_SUFFIX;
  subject = subject.replace(/ /g, '_').replace(REMOVE_PARTIAL_TOKEN_REGEX, '');

  // no-op for empty string
  if( '' === subject.trim() ){ return cb( null, [] ); }

  if( isPartialToken ){
    this._queryBool(
      this.prepare( query.has_subject_autocomplete ),
      { subject: `"${subject}" OR "${subject}"*` },
      cb
    );
  } else {
    this._queryBool(
      this.prepare( query.has_subject_autocomplete ),
      { subject: `"${subject}"` },
      cb
    );
  }
};

module.exports.matchSubjectDistinctSubjectIds = function( subject, cb ){
  var isPartialToken = subject.slice(-1) === PARTIAL_TOKEN_SUFFIX;

  // no-op for empty string
  if( '' === subject.trim() ){ return cb( null, [] ); }

  if( isPartialToken ){
    subject = subject.replace(/ /g, '_').replace(REMOVE_PARTIAL_TOKEN_REGEX, '');
    if( '' === subject.trim() ){ return cb( null, [] ); }

    this._queryAll(
      this.prepare( query.match_subject_autocomplete_distinct_subject_ids ),
      { subject: `"${subject}" OR "${subject}"*`, limit: MAX_RESULTS },
      cb
    );
  } else {
    this._queryAll(
      this.prepare( query.match_subject_distinct_subject_ids ),
      { subject: subject, limit: MAX_RESULTS },
      cb
    );
  }
};

module.exports.matchSubjectObject = function( subject, object, cb ){
  var isPartialToken = object.slice(-1) === PARTIAL_TOKEN_SUFFIX;

  // no-op for empty string
  if( '' === subject.trim() ){ return cb( null, [] ); }
  if( '' === object.trim() ){ return cb( null, [] ); }

  if( isPartialToken ){
    object = object.replace(/ /g, '_').replace(REMOVE_PARTIAL_TOKEN_REGEX, '');
    if( '' === object.trim() ){ return cb( null, [] ); }

    this._queryAll(
      this.prepare( query.match_subject_object_autocomplete ),
      {
        subject: subject,
        object: `${object}%`,
        limit: MAX_RESULTS
      },
      cb
    );
  } else {
    this._queryAll(
      this.prepare( query.match_subject_object ),
      {
        subject: subject,
        object: object,
        limit: MAX_RESULTS
      },
      cb
    );
  }
};

module.exports.matchSubjectObjectGeomIntersects = function( subject, object, cb ){
  var isPartialToken = object.slice(-1) === PARTIAL_TOKEN_SUFFIX;

  // no-op for empty string
  if( '' === subject.trim() ){ return cb( null, [] ); }
  if( '' === object.trim() ){ return cb( null, [] ); }

  // no-op when theshold is less than 0
  if( 0 > RTREE_THRESHOLD ){ return cb( null, [] ); }

  if( isPartialToken ){
    object = object.replace(/ /g, '_').replace(REMOVE_PARTIAL_TOKEN_REGEX, '');
    if( '' === object.trim() ){ return cb( null, [] ); }

    this._queryAll(
      this.prepare( query.match_subject_object_geom_intersects_autocomplete ),
      {
        subject: subject,
        object: `"${object}" OR "${object}"*`,
        threshold: RTREE_THRESHOLD,
        limit: MAX_RESULTS
      },
      cb
    );
  } else {
    this._queryAll(
      this.prepare( query.match_subject_object_geom_intersects ),
      {
        subject: subject,
        object: object,
        threshold: RTREE_THRESHOLD,
        limit: MAX_RESULTS
      },
      cb
    );
  }
};
