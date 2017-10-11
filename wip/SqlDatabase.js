
var State = require('./State');
const MAX_RESULTS = 1000;
const WILDCARD_LIMIT = 1000;

function SqlDatabase( db ){
  this.db = db;
}

// function quote( str ){ return str.replace( / /g, '_' ); }
function quote( str ){ return str.replace( / /g, '_' ); }
// function singleQuote( str ){ return '\'' + str + '\''; }
function addWildcard( str ){ return str + '*'; }
function quoteWildcard( str ){ return quote( addWildcard( str ) ); }

// cb( bool ) whether a 'subject' value exists in the db
SqlDatabase.prototype.hasSubject = function( subject, cb ){
  var sql = [
    'SELECT id',
    'FROM tokens',
    'WHERE tokens.rowid IN ( SELECT rowid FROM fulltext WHERE fulltext MATCH $subject )',
    'LIMIT 1'
  ].join('\n');

  var args = { $subject: quote( subject ) };

  this.db.get( sql, args, function( err, row ){
    cb( !err && row );
  });
};

SqlDatabase.prototype.hasSubjectAutocomplete = function( subject, cb ){
  var sql = [
    'SELECT id',
    'FROM tokens',
    'WHERE tokens.rowid IN ( SELECT rowid FROM fulltext WHERE fulltext MATCH $subject LIMIT $wLimit )',
    'LIMIT 1'
  ].join('\n');

  var args = { $subject: quoteWildcard( subject ), $wLimit: WILDCARD_LIMIT };

  this.db.get( sql, args, function( err, row ){
    cb( !err && row );
  });
};

SqlDatabase.prototype.matchSubject = function( subject, cb ){
  var sql = [
    'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'FROM tokens AS t1',
    'JOIN lineage AS l1 ON t1.id = l1.id',
    'JOIN tokens AS t2 ON t2.id = l1.pid',
    'WHERE t2.lang IN (\'und\', \'eng\', t1.lang )',
    // 'AND t1.token = $subject',
    'AND t1.rowid IN ( SELECT rowid FROM fulltext WHERE fulltext MATCH $subject )',
    'GROUP BY t1.id, t2.id',
    'LIMIT $limit'
  ].join('\n');

  var args = { $subject: quote( subject ), $limit: MAX_RESULTS };

  this.db.all( sql, args, function( err, rows ){
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

SqlDatabase.prototype.matchSubjectAutocomplete = function( subject, cb ){
  var sql = [
    'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'FROM tokens AS t1',
    'JOIN lineage AS l1 ON t1.id = l1.id',
    'JOIN tokens AS t2 ON t2.id = l1.pid',
    'WHERE t2.lang IN (\'und\', \'eng\', t1.lang )',
    'AND t1.rowid IN ( SELECT rowid FROM fulltext WHERE fulltext MATCH $subject LIMIT $wLimit )',
    'GROUP BY t1.id, t2.id',
    'LIMIT $limit'
  ].join('\n');

  var args = { $subject: quoteWildcard( subject ), $wLimit: WILDCARD_LIMIT, $limit: MAX_RESULTS };

  this.db.all( sql, args, function( err, rows ){
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

SqlDatabase.prototype.matchSubjectObject = function( subject, object, cb ){
  var sql = [
    'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'FROM tokens AS t1',
    'JOIN lineage AS l1 ON t1.id = l1.id',
    'JOIN tokens AS t2 ON t2.id = l1.pid AND t2.lang IN (\'und\', \'eng\', t1.lang )',
    'WHERE t1.rowid IN ( SELECT rowid FROM fulltext WHERE fulltext MATCH $subject )',
    'AND t2.rowid IN ( SELECT rowid FROM fulltext WHERE fulltext MATCH $object )',
    'GROUP BY t1.id, t2.id',
    'LIMIT $limit'
  ].join('\n');

  var args = { $subject: quote( subject ), $object: quote( object ), $limit: MAX_RESULTS };

  this.db.all( sql, args, function( err, rows ){
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

SqlDatabase.prototype.matchSubjectObjectAutocomplete = function( subject, object, cb ){
  var sql = [
    'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'FROM tokens AS t1',
    'JOIN lineage AS l1 ON t1.id = l1.id',
    'JOIN tokens AS t2 ON t2.id = l1.pid AND t2.lang IN (\'und\', \'eng\', t1.lang )',
    'WHERE t1.rowid IN ( SELECT rowid FROM fulltext WHERE fulltext MATCH $subject )',
    'AND t2.rowid IN ( SELECT rowid FROM fulltext WHERE fulltext MATCH $object LIMIT $wLimit )',
    'GROUP BY t1.id, t2.id',
    'LIMIT $limit'
  ].join('\n');

  var args = {
    $subject: quote( subject ),
    $object: quoteWildcard( object ),
    $wLimit: WILDCARD_LIMIT,
    $limit: MAX_RESULTS
  };

  this.db.all( sql, args, function( err, rows ){
    // console.error( 'matchSubjectObjectAutocomplete', err, rows );
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

module.exports = SqlDatabase;
