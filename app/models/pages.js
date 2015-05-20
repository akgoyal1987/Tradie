var assets = require("../../config/assets");
var db = require("seraph")(assets.db_url);

// private constructor:

var Pages = module.exports = function Pages(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

Pages.create = function (data, callback) {
  db.save(data, function(err, node) {
    var pg = new Pages(node);
    if (err) return callback(err);
    db.label(node,'StaticPages', function(err,pg) {
      if (err) return callback(err);
      callback(null, node);
    });
  }); 
};

Pages.update = function (data, callback) {  
  db.save(data, function(err, node) {
      var ads = new Pages(node);
      if (err) return callback(err);
        callback(null, node);
    }); 
};

Pages.getAll = function (callback) {
    var qry = "MATCH (n:StaticPages) RETURN n ORDER BY n.name ASC";
    db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, node);
  });
};

Pages.getPageByID = function (id, callback) {
    var qry = "MATCH (n:StaticPages) WHERE ID(n) = " + id + " RETURN n ORDER BY n.name ASC";
    db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, node);
  });
};

Pages.getPageByName = function (name, callback) {
    var qry = "MATCH (n:StaticPages) WHERE n.name = '" + name + "' RETURN n ORDER BY n.name ASC";
    console.log("qry",qry);
    db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, node);
  });
};
