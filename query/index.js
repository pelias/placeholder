
const fs = require('fs');
const path = require('path');

// load queries from filesystem
module.exports = fs.readdirSync(__dirname).reduce((memo, filename) => {
  var sql = fs.readFileSync( path.join( __dirname, filename ), 'utf8' ).trim();
  memo[ filename.replace('.sql', '' ) ] = sql;
  return memo;
}, {});
