var assets = require("../../config/assets");
var db = require("seraph")(assets.db_url);

// private constructor:

var Photos = module.exports = function photo(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

Photos.create = function (data, add, callback) {
  db.save(data, function(err, node) {
    var images = new Photos(node);
    if (err) return callback(err);
      db.label(node,'Images', function(err,ads) {
        if (err) return callback(err);
        console.log(node);
        db.relate(node.id,'belongs',add, function (err, rel) {
          callback(null, node);
        });
      });
    }); 
};

Photos.findByImageName =  function(imagename, callback){
  //var qru = "MATCH (n { imagename: '"+imagename+"' }) SET n.imagename = 'Taylor' RETURN n limit 1";
  var qry = "MATCH (n:Images {imagename:'"+imagename+"' })RETURN n limit 1";
  db.query(qry, function(err, node) {
    if(err){console.log(err);}
    callback(null, node);
  });
};