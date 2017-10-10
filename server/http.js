
var express = require('express'),
    Placeholder = require('../Placeholder.js');

const morgan = require( 'morgan' );
const logger = require('pelias-logger').get('interpolation');
const through = require( 'through2' );
const _ = require('lodash');

// optionally override port using env var
var PORT = process.env.PORT || 3000;
var app = express();

function log() {
  morgan.token('url', (req, res) => {
    // if there's a DNT header, just return '/' as the URL
    if (['DNT', 'dnt', 'do_not_track'].some(header => _.has(req.headers, header))) {
      return _.get(req, 'route.path');
    } else {
      return req.originalUrl;
    }
  });

  // 'short' format includes response time but leaves out date
  return morgan('short', {
    stream: through( function write( ln, _, next ){
      logger.info( ln.toString().trim() );
      next();
    })
  });
}

// make sure that logging is the first thing that happens for all endpoints
app.use(log());

// init placeholder
console.error( 'loading data' );
var ph = new Placeholder();
ph.load();

// store $ph on app
app.locals.ph = ph;

// routes
app.get( '/parser/search', require( './routes/search' ) );
app.get( '/parser/findbyid', require( './routes/findbyid' ) );
app.get( '/parser/query', require( './routes/query' ) );
app.get( '/parser/tokenize', require( './routes/tokenize' ) );

// demo page
app.use('/demo', express.static( __dirname + '/demo' ));
app.use('/', function( req, res ){ res.redirect('/demo#eng'); });

// start server
app.listen( PORT, function() {
  console.log( 'server listening on port', PORT );
});

// handle SIGTERM (required for fast docker restarts)
process.on('SIGTERM', function(){
  ph.close();
  app.close();
});
