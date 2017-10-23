
const MAX_RESULTS = 100;
// const WILDCARD_LIMIT = 100000;

var TIMER = false;
var DEBUG = false;
var AUTOCOMPLETE = false;
var TAG_BLACKLIST = [ 'colloquial' ];

// function debug(){}
function debug( sql, args ){
  if( !DEBUG ){ return; }
  var output = sql;
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

// cb( bool ) whether a 'subject' value exists in the db
module.exports.hasSubject = function( subject, cb ){

  var sql = [
    'SELECT id',
    'FROM tokens as t1',
      'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
    'WHERE f1.fulltext MATCH REPLACE($subject, " ", "_")',
    'LIMIT 1'
  ].join('\n');

  var args = {
    $subject: subject
  };

  debug( sql, args );

  if( TIMER ){ console.time('hasSubject'); }
  this.db.get( sql, args, function( err, row ){
    if( TIMER ){ console.timeEnd('hasSubject'); }
    cb( !err && row );
  });
};

module.exports.hasSubjectAutocomplete = function( subject, cb ){

  var sql = [
    'SELECT id',
    'FROM tokens as t1',
      'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
    'WHERE f1.fulltext MATCH $subject',
    ( TAG_BLACKLIST.length? 'AND t1.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
    'LIMIT 1'
  ].join('\n');

  subject = subject.replace(/ /g, '_');

  var args = {
    $subject: subject + ( AUTOCOMPLETE? ' OR ' + subject + '*':'' )
  };

  debug( sql, args );

  if( TIMER ){ console.time('hasSubjectAutocomplete'); }
  this.db.get( sql, args, function( err, row ){
    if( TIMER ){ console.timeEnd('hasSubjectAutocomplete'); }
    cb( !err && row );
  });
};

module.exports.matchSubjectDistinctSubjectIds = function( subject, cb ){
  var sql = [
    'SELECT DISTINCT( t1.id ) AS subjectId',
    'FROM tokens AS t1',
    'WHERE t1.token = $subject',
    ( TAG_BLACKLIST.length? 'AND t1.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
    'ORDER BY t1.id ASC',
    'LIMIT $limit'
  ].join('\n');

  var args = {
    $subject: subject,
    $limit: MAX_RESULTS
  };

  debug( sql, args );

  if( TIMER ){ console.time('matchSubject'); }
  this.db.all( sql, args, function( err, rows ){
    if( TIMER ){ console.timeEnd('matchSubject'); }
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

module.exports.matchSubjectAutocompleteDistinctSubjectIds = function( subject, cb ){

  var sql = [
    'SELECT DISTINCT( t1.id ) AS subjectId',
    'FROM tokens AS t1',
      'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
    'WHERE f1.fulltext MATCH $subject',
    ( TAG_BLACKLIST.length? 'AND t1.tag NOT IN ('+ singleQuoteEach(TAG_BLACKLIST).join(',') +')': '' ),
    'ORDER BY t1.id ASC',
    'LIMIT $limit'
  ].join('\n');

  subject = subject.replace(/ /g, '_');

  var args = {
    $subject: subject + ( AUTOCOMPLETE? ' OR ' + subject + '*':'' ),
    $limit: MAX_RESULTS
  };

  debug( sql, args );

  if( TIMER ){ console.time('matchSubjectAutocompleteDistinctSubjectIds'); }
  this.db.all( sql, args, function( err, rows ){
    if( TIMER ){ console.timeEnd('matchSubjectAutocompleteDistinctSubjectIds'); }
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

module.exports.matchSubjectObject = function( subject, object, cb ){
  var sql = [
    // 'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
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

  var args = {
    $subject: subject,
    $object: object,
    $limit: MAX_RESULTS
  };

  debug( sql, args );

  if( TIMER ){ console.time('matchSubjectObject'); }
  this.db.all( sql, args, function( err, rows ){
    if( TIMER ){ console.timeEnd('matchSubjectObject'); }
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

module.exports.matchSubjectObjectAutocomplete = function( subject, object, cb ){
  var sql = [
    // 'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
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

  var args = {
    $subject: subject,
    $object: object + ( AUTOCOMPLETE? '%':'' ),
    $limit: MAX_RESULTS
  };

  debug( sql, args );

  if( TIMER ){ console.time('matchSubjectObjectAutocomplete'); }
  this.db.all( sql, args, function( err, rows ){
    if( TIMER ){ console.timeEnd('matchSubjectObjectAutocomplete'); }
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};
