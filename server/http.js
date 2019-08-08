
/**
  The http server improves performance on multicore machines by using the
  node core 'cluster' module to fork worker processes.

  The default setting is to use all available CPUs, this will spawn 32 child
  processes on a 32 core machine.

  If you would like to disable this feature (maybe because you are running
  inside a container) then you can do so by setting the env var CPUS=1

  You may also specify exactly how many child processes you would like to
  spawn by setting the env var to a numeric value >1, eg CPUS=4

  If the CPUS env var is set less than 1 or greater than os.cpus().length
  then the default setting will be used (using all available cores).
**/

const os = require('os');
const morgan = require('morgan');
const express = require('express');
const cluster = require('cluster');
const through = require('through2');
const _ = require('lodash');

const Placeholder = require('../Placeholder.js');
const logger = require('pelias-logger').get('placeholder');

// select the amount of cpus we will use
const envCpus = parseInt( process.env.CPUS, 10 );
const cpus = Math.min( Math.max( envCpus || Infinity, 1 ), os.cpus().length );

// optionally override port/host using env var
var PORT = process.env.PORT || 3000;
var HOST = process.env.HOST || undefined;
var app = express();

// store the express http server so it can be terminated gracefully later
let server;

//record whether the service is terminating to control what events are worth logging
let terminating = false;

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
var ph = new Placeholder({ readonly: true });
ph.load();

// ensure the database schemas match what is expected by the codebase.
try { ph.checkSchema(); }
catch( e ){
  console.info('------------------------------------------------------');
  console.error('Database schema is out-of-date!');
  console.info('Your database files do not match the expected schema.');
  console.info('Please follow instructions in the README to obtain new database files.');
  console.info('This is the expected behaviour for breaking schema updates.');
  console.info('more info: https://github.com/pelias/placeholder');
  console.info('------------------------------------------------------');
  process.exit(1);
}

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

// handle SIGINT and SIGTERM (required for fast docker restarts)
function handler() {
  ph.close();

  terminating = true;
  if (cluster.isMaster) {
    logger.info('Placeholder service shutting down');
    for (const id in cluster.workers) {
      cluster.workers[id].kill('SIGINT');
    }
  }

  if (server) {
    server.close();
  }
}

process.on('SIGINT', handler);
process.on('SIGTERM', handler);

// start multi-threaded server
if( cpus > 1 ){
  if( cluster.isMaster ){
    logger.info('[master] using %d cpus', cpus);

    // worker exit event
    cluster.on('exit', (worker, code, signal) => {
      if (!terminating) {
        logger.error('[master] worker died', worker.process.pid);
      }
    });

    // worker fork event
    cluster.on('fork', (worker, code, signal) => {
      logger.info('[master] worker forked', worker.process.pid);
    });

    // fork workers
    for( var c=0; c<cpus; c++ ){
      cluster.fork();
    }

  } else {
    server = app.listen( PORT, HOST, () => {
      logger.info('[worker %d] listening on %s:%s', process.pid, HOST||'0.0.0.0', PORT);
    });
  }
}

// start single-threaded server
else {
  logger.info('[master] using %d cpus', cpus);

  server = app.listen( PORT, HOST, () => {
    logger.info('[master] listening on %s:%s', HOST||'0.0.0.0', PORT);
  });
}
