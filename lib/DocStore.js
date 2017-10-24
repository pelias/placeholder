
var util = require('util');
var Database = require('./Database');

// document store database
function DocStore(){}
util.inherits( DocStore, Database );

DocStore.prototype.reset = function(){
  this.db.serialize(() => {
    this.db.run('DROP TABLE IF EXISTS docs;');
    this.db.run('CREATE TABLE docs( id INTEGER PRIMARY KEY, json TEXT );');
  }.bind(this));
};

DocStore.prototype.set = function( id, doc, cb ){
  this.db.run(
    'INSERT INTO docs ( id, json ) VALUES ( $id, $json );',
    { $id: id, $json: Database.codec.encode( doc ) }, cb
  );
};

DocStore.prototype.get = function( id, cb ){
  this.db.get(
    'SELECT json FROM docs WHERE id = $id LIMIT 1;',
    { $id: id }, function( err, doc ){
      if( err ){ return cb( err ); }
      if( !doc ){ return cb( 'not found' ); }
      return cb( null, Database.codec.decode( doc ) );
    }
  );
};

DocStore.prototype.getMany = function( ids, cb ){
  this.db.all(
    'SELECT json FROM docs WHERE id IN ($ids);'.replace('$ids', ids.join(',')), function( err, docs ){
      if( err ){ return cb( err ); }
      if( !docs ){ return cb( 'not found' ); }
      return cb( null, docs.map( Database.codec.decode ));
    }
  );
};

module.exports = DocStore;
