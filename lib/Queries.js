
// load SQL queries from filesystem
const query = require('../query/index');
const MAX_RESULTS = 100;
const DEBUG = false;
const AUTOCOMPLETE = false;

// function debug(){}
function debug( stmt, args, cb ){
  if( !DEBUG ){ return cb; }
  var query = renderQuery( stmt, args );
  var start = new Date().getTime();
  return () => {
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
    cb( null, rows );
  } catch ( err ){
    console.error( err );
    return cb( err );
  }
};

// cb( bool ) whether a 'subject' value exists in the db
module.exports.hasSubject = function( subject, cb ){
  this._queryBool(
    this.prepare( query.has_subject ),
    { subject: subject },
    cb
  );
};

module.exports.hasSubjectAutocomplete = function( subject, cb ){
  subject = subject.replace(/ /g, '_');
  this._queryBool(
    this.prepare( query.has_subject_autocomplete ),
    { subject: subject + ( AUTOCOMPLETE? ' OR ' + subject + '*':'' ) },
    cb
  );
};

module.exports.matchSubjectDistinctSubjectIds = function( subject, cb ){
  this._queryAll(
    this.prepare( query.match_subject_distinct_subject_ids ),
    { subject: subject, limit: MAX_RESULTS },
    cb
  );
};

module.exports.matchSubjectAutocompleteDistinctSubjectIds = function( subject, cb ){
  subject = subject.replace(/ /g, '_');
  this._queryAll(
    this.prepare( query.match_subject_autocomplete_distinct_subject_ids ),
    {
      subject: subject + ( AUTOCOMPLETE? ' OR ' + subject + '*':'' ),
      limit: MAX_RESULTS
    },
    cb
  );
};

module.exports.matchSubjectObject = function( subject, object, cb ){
  this._queryAll(
    this.prepare( query.match_subject_object ),
    {
      subject: subject,
      object: object,
      limit: MAX_RESULTS
    },
    cb
  );
};

module.exports.matchSubjectObjectAutocomplete = function( subject, object, cb ){
  this._queryAll(
    this.prepare( query.match_subject_object_autocomplete ),
    {
      subject: subject,
      object: object + ( AUTOCOMPLETE? '%':'' ),
      limit: MAX_RESULTS
    },
    cb
  );
};
