var assets = require("../../config/assets");
var db = require("seraph")(assets.db_url);

// private constructor:

var Usertypes = module.exports = function User(_node) {
   // all we'll really store is the node; the rest of our properties will be
   // derivable or just pass-through properties (see below).
   this._node = _node;
}

Usertypes.create = function (data,user, callback) {
 db.save(data, function(err, node) {
     var usertypes = new Usertypes(node);
     if (err) return callback(err);
       db.label(node,'Usertypes', function(err,usertypes) {
         if (err) return callback(err);
         console.log(node);
         db.relate(user,'usertype',node.id, function (err, rel) {
           callback(null, usertypes);
         });
       });
   }); 
};

Usertypes.getAll = function (callback) {
  db.nodesWithLabel('Usertypes', function(err, results) {     
    callback(null,  results);
  });
};