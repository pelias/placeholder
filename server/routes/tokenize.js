
module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  // var tokens = ph.tokenize( req.query.text );

  ph.tokenize( req.query.text, ( err, groups ) => {
    res.status(200).json( groups );
  });

};
