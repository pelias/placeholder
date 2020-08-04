const base_tokenize = require('./base_tokenize');

module.exports = function( req, res ){
  base_tokenize(req, (err, groups) => {
    // for the legacy endpoint, send back a bare string[][]
    // an array of groups of phrases:
    // - ex: "pizza new york ny" -> [["new york", "ny"]]
    res.status(200).json( groups.map((group) => group.map(g => g.phrase)) );
  });
};
