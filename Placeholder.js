
var _ = require('lodash'),
    DocStore = require('./lib/DocStore'),
    TokenIndex = require('./lib/TokenIndex');

// constructor
function Placeholder( options ){
  this.store = new DocStore( options );
  this.index = new TokenIndex( options );
}

// load prototype methods from modules
Placeholder.prototype = _.extend( Placeholder.prototype,
  require('./prototype/io.js'),
  require('./prototype/query.js'),
  require('./prototype/statistics.js'),
  // require('./prototype/token.js'),
  require('./prototype/tokenize.js'),
  require('./prototype/wof.js')
);

module.exports = Placeholder;
