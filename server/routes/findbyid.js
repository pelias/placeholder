
module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  var ids = ( req.query.ids || '' ).split(',').map( function( id ){
    return parseInt( id.trim(), 10 );
  }).filter( function( id ){
    return !isNaN( id );
  });

  var lang;
  if( req.query.lang && req.query.lang.length === 3 ){
    lang = req.query.lang;
  }

  // load docs
  ph.store.getMany( ids, function( err, documents ){
    if( err ){ return res.status(500).send({}); }
    if( !documents || !documents.length ){ return res.status(404).send({}); }

    var docs = {};
    for( var i=0; i<documents.length; i++ ){
      var result = documents[i];
      // Send only wanted lang
      const translation = result.names[lang];
      if ( lang && Array.isArray(translation) ) {
        result.names = {};
        result.names[lang] = translation;
      }
      docs[ result.id ] = result;
    }

    res.status(200).json(docs);
  });
};
