
var State = function( subject, object, id, value ){
  this.subject = subject;
  this.object = object;
  this.id = id;
  this.value = value || null;
};

module.exports = State;
