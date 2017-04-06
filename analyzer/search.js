
var through = require('through2');
var dir = require('require-dir');

var analysis = require('pelias-analysis');
var tokenizer = analysis.tokenizer;
var config = dir('./config');
var util = analysis.lib.util;

function analyzer( token, cb ){
  var tap = through.obj();

  tap.pipe( tokenizer.charmap({ map: config.character_map }) )
     .pipe( tokenizer.split() )
     .pipe( tokenizer.lowercase() )
     .pipe( tokenizer.diacritic() )
     .pipe( tokenizer.synonyms({ map: config.first_token, position: 1 }) )
     .pipe( tokenizer.synonyms({ map: config.address_suffix }) )
     .pipe( tokenizer.synonyms({ map: config.directionals }) )
     .pipe( util.collect( cb ) );

  tap.write( token );
  tap.end();
}

module.exports = analyzer;
