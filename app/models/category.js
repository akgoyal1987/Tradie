var assets = require("../../config/assets");
var db = require("seraph")(assets.db_url);
var User = require('./user')

// private constructor:

var Category = module.exports = function Category(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

Category.create = function (categoryname, callback) {
  db.save({categoryname : categoryname}, function(err, node) {
    var category = new Category(node);
    if (err) return callback(err);
    db.label(node,'Category', function(err,category) {
      if (err){ callback(err); }
      else{
        callback(null, node);
      } 
    });
  }); 
};

Category.findByCategoryName = function (categoryname, callback) {
    var qry = "MATCH (c:Category) where c.categoryname='"+ categoryname + "' RETURN c";
    console.log(qry);
    db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, node);
  });
};

Category.getAllCategories = function (callback) {
    var qry = "MATCH (c:Category) RETURN c";
    var arr = [];
    db.query(qry, function (err, node) {
      if (err) return callback(err);
      if (typeof(node) === 'object' && node.length == undefined)
      {  
          arr.push(node);
          node = arr;
      } 
      callback(null, node);
  });
};
