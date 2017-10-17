
var express = require('express'),
    cluster = require('cluster'),
    Placeholder = require('../Placeholder.js'),
    multicore = true;

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
var ph = new Placeholder({ readonly: true });
ph.load();

// store $ph on app
app.locals.ph = ph;

// generic http headers
app.use((req, res, next) => {
  res.header('Charset','utf8');
  res.header('Cache-Control','public, max-age=120');
  next();
});

// routes
app.get( '/parser/search', require( './routes/search' ) );
app.get( '/parser/findbyid', require( './routes/findbyid' ) );
app.get( '/parser/query', require( './routes/query' ) );
app.get( '/parser/tokenize', require( './routes/tokenize' ) );

// demo page
app.use('/demo', express.static( __dirname + '/demo' ));
app.use('/', (req, res) => { res.redirect('/demo#eng'); });

// handle SIGTERM (required for fast docker restarts)
process.on('SIGTERM', () => {
  ph.close();
  app.close();
});

// start multi-threaded server
if( true === multicore ){
  if( cluster.isMaster ){

    // fork workers
    require('os').cpus().forEach(cpu => {
      cluster.fork();
    });

    cluster.on('exit', (worker, code, signal) => {
      console.log('worker ' + worker.process.pid + ' died');
    });

  } else {
    app.listen( PORT, () => {
      console.log( 'worker listening on port', PORT );
    });
  }
}

// start single-threaded server
else {
  app.listen( PORT, () => {
    console.log( 'server listening on port', PORT );
  });
}
