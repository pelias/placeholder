
const _ = require('lodash');
const util = require('./_util');
const analysis = require('../../lib/analysis');
const PARTIAL_TOKEN_SUFFIX = require('../../lib/analysis').PARTIAL_TOKEN_SUFFIX;

const max_combinations = parseInt(process.env.MAX_COMBINATIONS, 10) || 1e9;

function removeExpensiveTokens(ph, text) {
  const tokens = analysis.tokenize(text).flat();

  const stmt = ph.store.db.prepare('SELECT count(*) from fulltext where fulltext.fulltext = ?');

  const counts = tokens.map(function(token) {
    return stmt.get(token)['count(*)'];
  });

  // tokens that do not exceed the combination limit will be pushed here
  let final_tokens = [];

  var combinations = 1;
  let limit_reached = false;

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx];
    const count = Math.max(counts[idx], 1);

    combinations *= count;

    if (combinations <= max_combinations) {
      final_tokens.push(token);
    }
  }

  return final_tokens.join(' ');
}

module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  // input text
  var text = req.query.text || '';

  // placetype filter
  var filter = { placetype: util.arrayParam( req.query.placetype ) };

  // live mode (autocomplete-style search)
  // we append a byte indicating the last word is potentially incomplete.
  // except where the last token is a space, then we simply trim the space.
  if( req.query.mode === 'live' ){
    if( ' ' === text.slice(-1) ){
      text = text.trim();
    } else {
      text += PARTIAL_TOKEN_SUFFIX;
    }
  }

  const queryText = removeExpensiveTokens( ph, text);

  // perform query
  console.time('took');
  ph.query( queryText, ( err, result ) => {
    console.timeEnd('took');

    // language property
    var lang;
    if( 'string' === typeof req.query.lang && req.query.lang.length === 3 ){
      lang = req.query.lang.toLowerCase();
    }

    // fetch all result docs by id
    ph.store.getMany( result.getIdsAsArray(), function( err, documents ){
      if( err ){ return res.status(500).send(err); }
      if( !documents || !documents.length ){ return res.status(200).send([]); }

      // placetype filter
      if( Array.isArray( filter.placetype ) && filter.placetype.length ){
        documents = documents.filter(res => _.includes( filter.placetype, res.placetype ));
      }

      // get a list of parent ids
      const parentIds = getParentIds( documents );

      // load all the parents
      ph.store.getMany( parentIds, ( err, parentResults ) => {

        // a database error occurred
        if( err ){ console.error( 'error fetching parent ids', err ); }

        // handle case where the database was unable to return any rows
        parentResults = parentResults || [];

        // create a map of parents
        const parents = rowsToIdMap( parentResults );

        // map documents to dict using id as key
        const docs = documents.map( function( result ){
          return mapResult( ph, result, parents, lang );
        });

        // sort documents according to sorting rules
        docs.sort( sortingAlgorithm );

        // send json
        res.status(200).json( docs );
      });
    });
  });
};

/**
  sort highest 'population' first, using 'geom.area' as a second
  sorting condition where population data is not available.
**/
function sortingAlgorithm( a, b ){

  // condition 1 - population
  const a1 = a.population || 0;
  const b1 = b.population || 0;

  // condition 2 - geom.area
  const a2 = a.geom && a.geom.area || 0;
  const b2 = b.geom && b.geom.area || 0;

  if( a1 < b1 ){ return +1; }
  if( a1 > b1 ){ return -1; }
  if( a2 < b2 ){ return +1; }
  if( a2 > b2 ){ return -1; }
  return 0;
}

function mapResult( ph, result, parents, lang ){

  // swap languages
  if( Array.isArray( result.names[lang] ) && result.names[lang].length ){
    result.name = result.names[lang][0];
    result.languageDefaulted = false;
  } else {
    result.languageDefaulted = true;
  }

  // delete language properties
  delete result.names;

  // delete rank properties
  delete result.rank;

  result.lineage = result.lineage.map( function( lineage ){
    return mapLineage( ph, lineage, parents, lang );
  });
  return result;
}

function mapLineage( ph, lineage, parents, lang ){
  const res = {};

  for( var attr in lineage ){
    var parent = parents[ lineage[ attr ] ];

    if( !parent ){
      console.error( 'parent not found!', attr, lineage[ attr ] );
      continue;
    }

    var name = parent.name;
    var languageDefaulted = true;

    // swap languages
    if( Array.isArray( parent.names[lang] ) && parent.names[lang].length ){
      languageDefaulted = false;
      name = parent.names[lang][0];
    }

    res[ parent.placetype ] = {
      id: parent.id,
      name: name,
      abbr: parent.abbr,
      languageDefaulted: languageDefaulted
    };
  }

  return res;
}

// convert array of results to map using id as key
function rowsToIdMap( rows ){
  const map = {};
  rows.forEach( function( row ){
    map[ row.id ] = row;
  });
  return map;
}

// get a unique array of parent ids
function getParentIds( results ){
  const parentIds = {};
  results.forEach( function( row ){
    row.lineage.forEach( function( lineage ){
      for( var attr in lineage ){
        parentIds[ lineage[attr] ] = true;
      }
    });
  });
  return Object.keys( parentIds );
}
