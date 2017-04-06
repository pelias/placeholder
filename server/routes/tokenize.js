
module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  var tokens = ph.tokenize( req.query.text );

  res.status(200).json( tokens );
};
