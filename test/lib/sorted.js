
var sorted = require('../../lib/sorted');

// sort
module.exports.sort = function(test, common) {

  // test runner
  var assert = function( actual, expected ){
    test( 'sort', function(t) {
      t.deepEqual( sorted.sort( actual ), expected );
      t.end();
    });
  };

  assert([0, 10, 4, -1, 5, 5, 3], [ -1, 0, 3, 4, 5, 5, 10 ]);
  assert([0, 9, 4, -10, 5, 5, 2], [ -10, 0, 2, 4, 5, 5, 9 ]);
};

// sorted merge
module.exports.merge = function(test, common) {

  // test runner
  var assert = function( a, b, expected ){
    test( 'merge', function(t) {
      t.deepEqual( sorted.merge( a, b ), expected );
      t.end();
    });
  };

  assert(
    [ -1, 0, 3, 4, 5, 5, 10 ],
    [ -10, 0, 2, 4, 5, 5, 9 ],
    [ -10, -1, 0, 2, 3, 4, 5, 9, 10 ]
  );
};

// sorted intersect
module.exports.intersect = function(test, common) {

  // test runner
  var assert = function( a, b, expected ){
    test( 'intersect', function(t) {
      t.deepEqual( sorted.intersect([ a, b ]), expected );
      t.end();
    });
  };

  assert(
    [ -1, 0, 3, 4, 5, 5, 10 ],
    [ -10, 0, 2, 4, 5, 5, 9 ],
    [ 0, 4, 5, 5 ]
  );
};

// sorted unique
module.exports.unique = function(test, common) {

  // test runner
  var assert = function( a, expected ){
    test( 'unique', function(t) {
      t.deepEqual( sorted.unique( a ), expected );
      t.end();
    });
  };

  assert(
    [ -1, 0, 0, 3, 4, 5, 5, 10 ],
    [ -1, 0, 3, 4, 5, 10 ]
  );
};
