var assets = require("../../config/assets");
var db = require("seraph")(assets.db_url);

// private constructor:

var Replyusers = module.exports = function User(_node) {
   // all we'll really store is the node; the rest of our properties will be
   // derivable or just pass-through properties (see below).
   this._node = _node;
}

Replyusers.create = function (data,user, callback) {
 db.save(data, function(err, node) {
     var replyusers = new Replyusers(node);
     if (err) return callback(err);
       db.label(node,'ReplyUsers', function(err,replyusers) {
         if (err) return callback(err);
         console.log(node);
         db.relate(user,'replyuser',node.id, function (err, rel) {
           callback(null, replyusers);
         });
       });
   }); 
};

Replyusers.getAll = function (callback) {
  db.nodesWithLabel('ReplyUsers', function(err, results) {     
    callback(null,  results);
  });
};