var Token = require('../../analyzer/Token');
var search = require('../../analyzer/search');

module.exports.search = function(test, util) {

  var assert = runner.bind(null, test);

  assert('Truth or Consequences', ['truth', 'or', 'consequences']);
  assert('Montréal', ['montreal']);
  assert('O\'Donnell', ['odonnell']);
  assert('Luz-Saint-Sauveur', ['luz', 'saint', 'sauveur']);
  assert('Wilkes-Barre', ['wilkes', 'barre']);
  assert('N Carolina', ['north', 'carolina']);
  assert('Sault Sainte Marie', ['sault', 'sainte', 'marie']);
  assert('Lancaster,PA', ['lancaster', 'pa']);
  assert('Charleston, S.C.', ['charleston', 'sc']);

};

// convenience function for writing quick 'n easy test cases
function runner( test, actual, expected ){
  test( actual, function(t) {
    search( new Token( actual ), function( tokens ){

      // expects the same amount of tokens
      if( tokens.length !== expected.length ){
        t.fail('expected token count');
      }
      // check each token body matched expected value
      else {
        expected.forEach( function( expectedBody, i ){
          t.deepEqual( tokens[i], {
            body:         expectedBody,
            position:     i+1,
            count:        tokens.length,
            isComplete:   i !== expected.length -1
          }, expectedBody);
        });
      }

      t.end();
    });
  });
}
