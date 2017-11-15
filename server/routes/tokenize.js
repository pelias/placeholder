
const PARTIAL_TOKEN_SUFFIX = require('../../lib/analysis').PARTIAL_TOKEN_SUFFIX;

module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  // input text
  var text = req.query.text || '';

  // live mode (autocomplete-style search)
  // we append a byte indicating the last word is potentially incomplete.
  // except where the last token is a space, then we simply trim the space.
  if( req.query.mode === 'live' ){
    if( ' ' === text.slice(-1) ){
      text = text.trim();
    } else {
      text += PARTIAL_TOKEN_SUFFIX;
    }
  }

  ph.tokenize( text, ( err, groups ) => {
    res.status(200).json( groups );
  });
};
