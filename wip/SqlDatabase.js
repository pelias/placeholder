
var State = require('./State');
const MAX_RESULTS = 1000;

function SqlDatabase( db ){
  this.db = db;
}

// cb( bool ) whether a 'subject' value exists in the db
SqlDatabase.prototype.hasSubject = function( subject, cb ){
  var sql = [
    'SELECT id',
    'FROM tokens',
    'WHERE token = $subject',
    'LIMIT 1'
  ].join('\n');

  var args = { $subject: subject };

  this.db.get( sql, args, function( err, row ){
    cb( !err && row );
  });
};

SqlDatabase.prototype.hasSubjectAutocomplete = function( subject, cb ){
  var sql = [
    'SELECT id',
    'FROM tokens',
    'WHERE token LIKE $subject',
    'LIMIT 1'
  ].join('\n');

  var args = { $subject: subject + '%' };

  this.db.get( sql, args, function( err, row ){
    cb( !err && row );
  });
};

SqlDatabase.prototype.matchSubjectAutocomplete = function( subject, cb ){
  var sql = [
    'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'FROM tokens AS t1',
    'JOIN lineage AS l1 ON t1.id = l1.id',
    'JOIN tokens AS t2 ON t2.id = l1.pid',
    'WHERE t2.lang IN (\'und\', \'eng\', t1.lang )',
    'AND t1.token LIKE $subject',
    'GROUP BY t1.id, t2.id',
    'LIMIT $limit'
  ].join('\n');

  var args = { $subject: subject + '%', $limit: MAX_RESULTS };

  this.db.all( sql, args, function( err, rows ){
    // console.error( 'matchSubjectAutocomplete', err, rows );
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

SqlDatabase.prototype.matchSubjectObjectAutocomplete = function( subject, object, cb ){
  var sql = [
    'SELECT t1.id AS subjectId, t1.token AS subject, t2.id as objectId, t2.token AS object',
    'FROM tokens AS t1',
    'JOIN lineage AS l1 ON t1.id = l1.id',
    'JOIN tokens AS t2 ON t2.id = l1.pid',
    'WHERE t2.lang IN (\'und\', \'eng\', t1.lang )',
    'AND t1.token = $subject',
    'AND t2.token LIKE $object',
    'GROUP BY t1.id, t2.id'
  ].join('\n');

  var args = { $subject: subject, $object: object + '%' };

  this.db.all( sql, args, function( err, rows ){
    // console.error( 'matchSubjectObjectAutocomplete', err, rows );
    if( err || !Array.isArray( rows ) ){ return cb( err, [] ); }
    cb( null, rows );
  });
};

module.exports = SqlDatabase;
