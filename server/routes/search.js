
var analysis = require('../../lib/analysis');

module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  // perform query
  var permutations = ph.tokenize( req.query.text );
  var q = ph.query( permutations );

  // @todo: don't run tokenize again, it was previously run by ph.tokenize()
  var tokens = analysis.tokenize( req.query.text );
  var tokensAsString = tokens[q.match.index].join(' ');
  var unparsedPrefix = tokensAsString.substring( 0, tokensAsString.indexOf( q.match.token )-1 );

  console.error('tokens:', tokens);
  console.error('match:', q.match);
  console.error('unparsedPrefix:', unparsedPrefix);

  // language property
  var lang;
  if( req.query.lang && req.query.lang.length === 3 ){
    lang = req.query.lang;
  }

  // fetch all result docs by id
  ph.store.getMany( q.ids, function( err, results ){
    if( err ){ return res.status(500).send(err); }
    if( !results || !results.length ){ return res.status(200).send([]); }

    // get a list of parent ids
    var parentIds = getParentIds( results );

    // load all the parents
    ph.store.getMany( parentIds, function( err, parentResults ){

      // @todo handle errors
      // if( err ){ return res.status(500).send({}); }
      // if( !parentResults || !parentResults.length ){ return res.status(404).send({}); }
      parentResults = parentResults || [];

      // create a map of parents
      var parents = rowsToIdMap( parentResults );

      // map documents to dict using id as key
      var docs = results.map( function( result ){
        return mapResult( ph, result, parents, lang );
      });

      // sort results according to sorting rules
      docs.sort( sortingAlgorithm );

      res.status(200).json( docs );
    });
  });
};

/**
  sort highest 'population' first, using 'geom.area' as a second
  sorting condition where population data is not available.
**/
function sortingAlgorithm( a, b ){

  // condition 1 - population
  var a1 = a.population || 0;
  var b1 = b.population || 0;

  // condition 2 - geom.area
  var a2 = a.geom && a.geom.area || 0;
  var b2 = b.geom && b.geom.area || 0;

  if( a1 < b1 ){ return +1; }
  if( a1 > b1 ){ return -1; }
  if( a2 < b2 ){ return +1; }
  if( a2 > b2 ){ return -1; }
  return 0;
}

function mapResult( ph, result, parents, lang ){

  // swap languages
  if( lang && Array.isArray( result.names[lang] ) && result.names[lang].length ){
    result.name = result.names[lang][0];
    result.languageDefaulted = false;
  } else {
    result.languageDefaulted = true;
  }

  // delete language properties
  delete result.names;

  result.lineage = result.lineage.map( function( lineage ){
    return mapLineage( ph, lineage, parents, lang );
  });
  return result;
}

function mapLineage( ph, lineage, parents, lang ){
  var res = {};

  for( var attr in lineage ){
    var parent = parents[ lineage[ attr ] ];

    if( !parent ){
      console.error( 'parent not found!', attr, lineage[ attr ] );
      continue;
    }

    var name = parent.name;
    var languageDefaulted = true;

    // swap languages
    if( lang && Array.isArray( parent.names[lang] ) && parent.names[lang].length ){
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
  var map = {};
  rows.forEach( function( row ){
    map[ row.id ] = row;
  });
  return map;
}

// get a unique array of parent ids
function getParentIds( results ){
  var parentIds = {};
  results.forEach( function( row ){
    row.lineage.forEach( function( lineage ){
      for( var attr in lineage ){
        parentIds[ lineage[attr] ] = true;
      }
    });
  });
  return Object.keys( parentIds );
}
