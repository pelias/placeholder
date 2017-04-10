
var express = require('express'),
    Placeholder = require('../Placeholder.js');

// optionally override port using env var
var PORT = process.env.PORT || 3000;
var app = express();

// init placeholder
console.error( 'loading data' );
var ph = new Placeholder();
ph.load();

// store $ph on app
app.locals.ph = ph;

// routes
app.get( '/parser/findbyid', require( './routes/findbyid' ) );
app.get( '/parser/search', require( './routes/search' ) );
app.get( '/parser/tokenize', require( './routes/tokenize' ) );

// demo page
app.use('/demo', express.static( __dirname + '/demo' ));
app.use('/', function( req, res ){ res.redirect('/demo'); });

// start server
app.listen( PORT, function() {
  console.log( 'server listening on port', PORT );
});

// handle SIGTERM (required for fast docker restarts)
process.on('SIGTERM', function(){
  ph.close();
  app.close();
});
