
var State = function( from, to, id, value ){
  this.from = from;
  this.to = to;
  this.id = id;
  this.value = value || null;
};

module.exports = State;
