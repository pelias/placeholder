
const PARTIAL_TOKEN_SUFFIX = require('../../lib/analysis').PARTIAL_TOKEN_SUFFIX;

module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  // input text
  var text = req.query.text || '';

  // live mode (autocomplete-style search)
  // we append a byte indicating the last word is potentially incomplete.
  if( req.query.mode === 'live' ){
    text += PARTIAL_TOKEN_SUFFIX;
  }

  // perform query
  console.time('took');
  ph.query( text, ( err, ids, mask, group ) => {
    console.timeEnd('took');
    res.status(200).json( ids );
  });
};
