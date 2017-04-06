
function DocStore(){
  this.docs = {};
}

DocStore.prototype.set = function( id, doc ){
  this.docs[ id ] = doc;
  return this;
};

DocStore.prototype.get = function( id ){
  return this.docs[ id ];
};

// // convenience function to instantiate docstore with preset values
// DocStore.from = function( docs ){
//   var store = new DocStore();
//   store.docs = docs;
//   return store;
// };

module.exports = DocStore;
