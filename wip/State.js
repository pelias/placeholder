
var util = require('util');

var State = function( subjectId, subject, objectId, object, value ){
  this.subjectId = subjectId;
  this.subject = subject;
  this.objectId = objectId;
  this.object = object;
  this.value = value || null;
};

State.prototype.fmtString = function(){
  return util.format(
    '"%s" (%d) >>> "%s" (%d)',
    this.subject,
    this.subjectId,
    this.object,
    this.objectId
  );
};

module.exports = State;
