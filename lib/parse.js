var through = require('through2');

function streamFactory(){
  return through.obj(function( row, _, next ){

    try {
      this.push( JSON.parse( row ) );
    } catch( e ){
      console.error( 'invalid json', e );
    }

    next();
  });
}

module.exports = streamFactory;
