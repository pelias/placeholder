
module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  var ids = ( req.query.ids || '' ).split(',').map( function( id ){
    return parseInt( id.trim(), 10 );
  }).filter( function( id ){
    return !isNaN( id );
  });

  // load docs
  var docs = {};
  ids.forEach( function( id ){
    var doc = ph.store.get( id );
    if( doc ){ docs[ id ] = doc; }
  });

  res.status(200).json(docs);
};
