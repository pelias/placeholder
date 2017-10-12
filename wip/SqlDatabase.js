
var State = require('./State');
const MAX_RESULTS = 100;
// const WILDCARD_LIMIT = 100000;

function SqlDatabase( db ){
  this.db = db;
}

// function quote( str ){ return str.replace( / /g, '_' ); }
function quote( str ){ return str.replace( / /g, '_' ); }
function singleQuote( str ){ return '\'' + str + '\''; }
function addWildcard( str ){ return str + '*'; }
function quoteWildcard( str ){ return quote( addWildcard( str ) ); }

var TIMER = true;

function debug( sql, args ){
  var output = sql;
  Object.keys( args ).forEach( key => {
    output = output.replace( key, singleQuote( args[ key ] ) );
  });
  console.error( output + ';' );
}

// cb( bool ) whether a 'subject' value exists in the db
SqlDatabase.prototype.hasSubject = function( subject, cb ){

  var sql = [
    'SELECT id',
    'FROM tokens as t1',
      'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
    'WHERE f1.fulltext MATCH $subject',
    'LIMIT 1'
  ].join('\n');

  var args = {
    $subject: quote( subject )
  };

  debug( sql, args );

  if( TIMER ){ console.time('hasSubject'); }
  this.db.get( sql, args, function( err, row ){
    if( TIMER ){ console.timeEnd('hasSubject'); }
    cb( !err && row );
  });
};

SqlDatabase.prototype.hasSubjectAutocomplete = function( subject, cb ){

  var sql = [
    'SELECT id',
    'FROM tokens as t1',
      'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
    'WHERE f1.fulltext MATCH $subject',
    'LIMIT 1'
  ].join('\n');

  var args = {
    $subject: quoteWildcard( subject )
  };

  if( TIMER ){ console.time('hasSubjectAutocomplete'); }
  this.db.get( sql, args, function( err, row ){
    if( TIMER ){ console.timeEnd('hasSubjectAutocomplete'); }
    cb( !err && row );
  });
};

SqlDatabase.prototype.matchSubject = function( subject, cb ){
  var sql = [
    'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'FROM lineage AS l1',
      'JOIN tokens AS t1 ON t1.id = l1.id',
        'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
      'JOIN tokens AS t2 ON t2.id = l1.pid',
    'WHERE t2.lang IN (\'und\', \'eng\', t1.lang )',
    'WHERE f1.fulltext MATCH $subject',
    'LIMIT $limit'
  ].join('\n');

  var args = {
    $subject: quote( subject ),
    $limit: MAX_RESULTS
  };

  if( TIMER ){ console.time('matchSubject'); }
  this.db.all( sql, args, function( err, rows ){
    if( TIMER ){ console.timeEnd('matchSubject'); }
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

SqlDatabase.prototype.matchSubjectAutocomplete = function( subject, cb ){
  var sql = [
    // 'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'SELECT t1.id AS subjectId, t1.token AS subject',
    'FROM lineage AS l1',
      'JOIN tokens AS t1 ON t1.id = l1.id',
        'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
      // 'JOIN tokens AS t2 ON t2.id = l1.pid',
    // 'WHERE t2.lang IN (\'und\', \'eng\', t1.lang )',
    'AND f1.fulltext MATCH $subject',
    // 'GROUP BY t1.id, t2.id',
    'GROUP BY t1.id',
    'LIMIT $limit'
  ].join('\n');

  var args = {
    $subject: quoteWildcard( subject ),
    $limit: MAX_RESULTS
  };

  debug( sql, args );

  if( TIMER ){ console.time('matchSubjectAutocomplete'); }
  this.db.all( sql, args, function( err, rows ){
    if( TIMER ){ console.timeEnd('matchSubjectAutocomplete'); }
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

SqlDatabase.prototype.matchSubjectObject = function( subject, object, cb ){
  var sql = [
    'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'FROM lineage AS l1',
      'JOIN tokens AS t1 ON t1.id = l1.id',
        'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
      'JOIN tokens AS t2 ON t2.id = l1.pid',
        'JOIN fulltext AS f2 ON f2.rowid = t2.rowid',
    'WHERE t2.lang IN (\'und\', \'eng\', t1.lang )',
    'AND f1.fulltext MATCH $subject',
    'AND f2.fulltext MATCH $object',
    'LIMIT $limit'
  ].join('\n');

  var args = {
    $subject: quote( subject ),
    $object: quote( object ),
    $limit: MAX_RESULTS
  };

  if( TIMER ){ console.time('matchSubjectObject'); }
  this.db.all( sql, args, function( err, rows ){
    if( TIMER ){ console.timeEnd('matchSubjectObject'); }
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

SqlDatabase.prototype.matchSubjectObjectAutocomplete = function( subject, object, cb ){
  var sql = [
    'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'FROM lineage AS l1',
      'JOIN tokens AS t1 ON t1.id = l1.id',
        'JOIN fulltext AS f1 ON f1.rowid = t1.rowid',
      'JOIN tokens AS t2 ON t2.id = l1.pid',
        'JOIN fulltext AS f2 ON f2.rowid = t2.rowid',
    'WHERE t2.lang IN (\'und\', \'eng\', t1.lang )',
    'AND f1.fulltext MATCH $subject',
    'AND f2.fulltext MATCH $object',
    'LIMIT $limit'
  ].join('\n');

  var args = {
    $subject: quote( subject ),
    $object: quoteWildcard( object ),
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

module.exports = SqlDatabase;
