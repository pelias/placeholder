
// in express, if you pass query params like this `?param[]=value`
// then the type of the param is Array and the code may be expecting a string.
// this convenience function allows either form to be used.
function arrayParam( param ){
  var res = [];

  // accept param as array. eg: param[]=value
  if( Array.isArray( param ) ){ res = param; }

  // accept param as string. eg: param=value
  if( 'string' === typeof param ){ res = param.split(','); }

  // trim strings and remove empty elements
  return res.map(a => a.trim()).filter(a => a.length);
}

module.exports.arrayParam = arrayParam;
