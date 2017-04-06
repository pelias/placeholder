
var GROUP_MIN = 1;
var GROUP_MAX = 6;

// produce all the possible token groups from adjacent input tokens (without reordering tokens)

module.exports.expand = function( tokens ){

  var groups = [];

  // favour smaller tokens over larger ones
  // for( var i=0; i<tokens.length; i++ ){
  //   for( var j=i+GROUP_MIN; j<i+GROUP_MIN+GROUP_MAX; j++ ){
  //     if( j > tokens.length ){ break; }
  //     groups.push( tokens.slice( i, j ) );
  //   }
  // }

  // favour larger tokens over shorter ones
  for( var i=0; i<tokens.length; i++ ){
    for( var j=i+GROUP_MAX; j>=i+GROUP_MIN; j-- ){
      if( j <= tokens.length ){
        groups.push( tokens.slice( i, j ) );
      }
    }
  }

  return groups;
};

/**
example:

input: [ 'soho', 'new', 'york', 'usa' ]

output: [
  [ 'soho' ],
  [ 'soho', 'new' ],
  [ 'soho', 'new', 'york' ],
  [ 'soho', 'new', 'york', 'usa' ],
  [ 'new' ],
  [ 'new', 'york' ],
  [ 'new', 'york', 'usa' ],
  [ 'york' ],
  [ 'york', 'usa' ],
  [ 'usa' ]
]
**/
