const base_tokenize = require('./base_tokenize');

module.exports = function( req, res ){
  base_tokenize(req, (err, groups) => {
    // for the tokenize2 endpoint, send back a json dict
    // {phrase: string, remainder: {before: string, after: string}}[][]
    // with an array of groups of phrase objects 

    res.status(200).json({ 
      groups 
    });
  });
};
