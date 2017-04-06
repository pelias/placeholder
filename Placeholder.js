
var _ = require('lodash'),
    TokenGraph = require('./lib/TokenGraph'),
    DocStore = require('./lib/DocStore');

// constructor
function Placeholder(){
  this.graph = new TokenGraph();
  this.store = new DocStore();
}

// load prototype methods from modules
Placeholder.prototype = _.extend( Placeholder.prototype,
  require('./prototype/io.js'),
  require('./prototype/query.js'),
  require('./prototype/statistics.js'),
  require('./prototype/token.js'),
  require('./prototype/tokenize.js'),
  require('./prototype/wof.js')
);

module.exports = Placeholder;
