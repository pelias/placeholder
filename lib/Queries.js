
const MAX_RESULTS = 100;
// const WILDCARD_LIMIT = 100000;

var TIMER = false;
var DEBUG = false;
var AUTOCOMPLETE = false;
var TAG_BLACKLIST = [ 'colloquial' ];

// function debug(){}
function debug( stmt, args ){
  if( !DEBUG ){ return; }
  var output = stmt.source;
  Object.keys( args ).forEach( key => {
    output = output.replace( key, '\'' + args[ key ] + '\'' );
  });
  console.error( '\x1b[36m' + output + ';' + '\x1b[0m' );
}

function singleQuoteEach( values ){
  return values.map( value => {
    return '\'' + value + '\'';
  });
}

const QUERY_HAS_SUBJECT = [
  'SELECT id',
  'FROM tokens as t1',
    'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
  'WHERE f1.fulltext MATCH REPLACE($subject, " ", "_")',
  'LIMIT 1'
].join('\n');

const QUERY_HAS_SUBJECT_AUTOCOMPLETE = [
  'SELECT id',
  'FROM tokens as t1',
    'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
  'WHERE f1.fulltext MATCH $subject',
  ( TAG_BLACKLIST.length? 'AND t1.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
  'LIMIT 1'
].join('\n');

const QUERY_MATCH_SUBJECT_DISTINCT_SUBJECT_IDS = [
  'SELECT DISTINCT( t1.id ) AS subjectId',
  'FROM tokens AS t1',
  'WHERE t1.token = $subject',
  ( TAG_BLACKLIST.length? 'AND t1.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
  'ORDER BY t1.id ASC',
  'LIMIT $limit'
].join('\n');

const QUERY_MATCH_SUBJECT_AUTOCOMPLETE_DISTINCT_SUBJECT_IDS = [
  'SELECT DISTINCT( t1.id ) AS subjectId',
  'FROM tokens AS t1',
    'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
  'WHERE f1.fulltext MATCH $subject',
  ( TAG_BLACKLIST.length? 'AND t1.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
  'ORDER BY t1.id ASC',
  'LIMIT $limit'
].join('\n');

const QUERY_MATCH_SUBJECT_OBJECT = [
  'SELECT t1.id AS subjectId, t2.id as objectId',
  'FROM lineage AS l1',
    'JOIN tokens AS t1 ON t1.id = l1.id',
    'JOIN tokens AS t2 ON t2.id = l1.pid',
  'WHERE t1.token = $subject',
  'AND t2.token = $object',
  'AND t1.lang IN (t2.lang, \'eng\', \'und\')',
  ( TAG_BLACKLIST.length? 'AND t1.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
  ( TAG_BLACKLIST.length? 'AND t2.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
  'ORDER BY t1.id ASC, t2.id ASC',
  'LIMIT $limit'
].join('\n');

const QUERY_MATCH_SUBJECT_OBJECT_AUTOCOMPLETE = [
  'SELECT t1.id AS subjectId, t2.id as objectId',
  'FROM lineage AS l1',
    'JOIN tokens AS t1 ON t1.id = l1.id',
    'JOIN tokens AS t2 ON t2.id = l1.pid',
  'WHERE t1.token = $subject',
  'AND t2.token LIKE $object',
  'AND t1.lang IN (t2.lang, \'eng\', \'und\')',
  ( TAG_BLACKLIST.length? 'AND t1.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
  ( TAG_BLACKLIST.length? 'AND t2.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
  'ORDER BY t1.id ASC, t2.id ASC',
  'LIMIT $limit'
].join('\n');

// generic boolean query
module.exports._queryBool = function( stmt, args, cb ){
  debug( stmt, args );
  if( TIMER ){ console.time('_queryBool'); }
  try {
    var row = stmt.get( args );
    if( TIMER ){ console.timeEnd('_queryBool'); }
    return cb( undefined !== row );
  } catch ( err ){
    console.error( err );
    console.error( stmt.source );
    return cb( false );
  }
};

// generic all query
module.exports._queryAll = function( stmt, args, cb ){
  debug( stmt, args );
  if( TIMER ){ console.time('_queryAll'); }
  try {
    var rows = stmt.all( args );
    if( TIMER ){ console.timeEnd('_queryAll'); }
    if( !Array.isArray( rows ) ){ return cb( null, [] ); }
    cb( null, rows );
  } catch ( err ){
    console.error( err );
    console.error( stmt.source );
    return cb( err );
  }
};

// cb( bool ) whether a 'subject' value exists in the db
module.exports.hasSubject = function( subject, cb ){
  this._queryBool(
    this.prepare( QUERY_HAS_SUBJECT ),
    { subject: subject },
    cb
  );
};

module.exports.hasSubjectAutocomplete = function( subject, cb ){
  subject = subject.replace(/ /g, '_');
  this._queryBool(
    this.prepare( QUERY_HAS_SUBJECT_AUTOCOMPLETE ),
    { subject: subject + ( AUTOCOMPLETE? ' OR ' + subject + '*':'' ) },
    cb
  );
};

module.exports.matchSubjectDistinctSubjectIds = function( subject, cb ){
  this._queryAll(
    this.prepare( QUERY_MATCH_SUBJECT_DISTINCT_SUBJECT_IDS ),
    { subject: subject, limit: MAX_RESULTS },
    cb
  );
};

module.exports.matchSubjectAutocompleteDistinctSubjectIds = function( subject, cb ){
  subject = subject.replace(/ /g, '_');
  this._queryAll(
    this.prepare( QUERY_MATCH_SUBJECT_AUTOCOMPLETE_DISTINCT_SUBJECT_IDS ),
    {
      subject: subject + ( AUTOCOMPLETE? ' OR ' + subject + '*':'' ),
      limit: MAX_RESULTS
    },
    cb
  );
};

module.exports.matchSubjectObject = function( subject, object, cb ){
  this._queryAll(
    this.prepare( QUERY_MATCH_SUBJECT_OBJECT ),
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
    this.prepare( QUERY_MATCH_SUBJECT_OBJECT_AUTOCOMPLETE ),
    {
      subject: subject,
      object: object + ( AUTOCOMPLETE? '%':'' ),
      limit: MAX_RESULTS
    },
    cb
  );
};
