
module.exports = function( req, res ){

  // placeholder
  var ph = req.app.locals.ph;

  // perform query
  var tokens = ph.tokenize( req.query.text );
  var ids = ph.query( tokens );

  // language property
  var lang;
  if( req.query.lang && req.query.lang.length === 3 ){
    lang = req.query.lang;
  }

  // fetch all result docs by id
  ph.store.getMany( ids, function( err, results ){
    if( err ){ return res.status(500).send({}); }
    if( !results || !results.length ){ return res.status(404).send({}); }

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

      // map dcuments to map using id as key
      var docs = {};
      for( var i=0; i<results.length; i++ ){
        var result = results[i];
        result = mapResult( ph, result, parents, lang );
        docs[ result.id ] = result;
      }

      res.status(200).json( docs );
    });
  });
};

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

  result.lineage = [
    mapLineage( ph, result.lineage, parents, lang )
  ];
  return result;
}

function mapLineage( ph, lineage, parents, lang ){
  var res = {};

  for( var attr in lineage ){
    var parent = parents[ lineage[ attr ] ];
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
    for( var attr in row.lineage ){
      parentIds[ row.lineage[attr] ] = true;
    }
  });
  return Object.keys( parentIds );
}
