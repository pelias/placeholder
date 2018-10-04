
module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  var ids = ( req.query.ids || '' ).split(',').map( function( id ){
    return parseInt( id.trim(), 10 );
  }).filter( function( id ){
    return !isNaN( id );
  });

  var lang;
  if( 'string' === typeof req.query.lang && req.query.lang.length === 3 ){
    lang = req.query.lang.toLowerCase();
  }

  // load docs
  ph.store.getMany( ids, function( err, documents ){
    if( err ){ return res.status(500).send({}); }
    if( !documents || !documents.length ){ return res.status(404).send({}); }

    var docs = {};
    for( var i=0; i<documents.length; i++ ){
      var result = documents[i];

      // return only the single language requested by the user
      // or, if not available, return all languages.
      // ref: https://github.com/pelias/placeholder/pull/128
      const translation = result.names[lang];
      if ( Array.isArray(translation) ) {
        result.names = {};
        result.names[lang] = translation;
      }
      docs[ result.id ] = result;
    }

    res.status(200).json(docs);
  });
};
