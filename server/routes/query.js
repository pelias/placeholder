
module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  var tokens = ph.tokenize( req.query.text );
  var results = ph.query( tokens ).ids;

  res.status(200).json( results );
};
