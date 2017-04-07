
module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  var ids = ( req.query.ids || '' ).split(',').map( function( id ){
    return parseInt( id.trim(), 10 );
  }).filter( function( id ){
    return !isNaN( id );
  });

  // load docs
  ph.store.getMany( ids, function( err, results ){
    if( err ){ return res.status(500).send({}); }
    if( !results || !results.length ){ return res.status(404).send({}); }

    var docs = {};
    for( var i=0; i<results.length; i++ ){
      var result = results[i];
      docs[ result.id ] = result;
    }

    res.status(200).json(docs);
  });
};
