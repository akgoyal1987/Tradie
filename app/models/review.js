var assets = require("../../config/assets");
var db = require("seraph")(assets.db_url);
var User = require('./user')

// private constructor:

var Review = module.exports = function Review(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

Review.create = function (data,adid, callback) {
  db.save(data, function(err, node) {
    var review = new Review(node);
    if (err) return callback(err);
    db.label(node,'Review', function(err,review) {
      if (err) return callback(err);
      console.log(node);
      db.relate(node.id,'belongs',adid, function (err, rel) {
        callback(null, node);
      });
    });
  }); 
};

Review.getAllReviews = function (adid, callback) {
    var qry = "MATCH (r:Review)-[:belongs]->(ad:Ads)WHERE ID(ad)="+adid+" return r";
    var arr = [];
    db.query(qry, function (err, node) {
      if (err) return callback(err);
      if (typeof(node) === 'object' && node.length == undefined)
      {  
          arr.push(node);
          node = arr;
      }       
      var i=-1;
      var next = function(){
        i++;
        if(i<node.length){
          User.findByID(node[i].userid, function(err, usr){
            node[i].user = usr._node[0];

            next();
          });
        }else{
          callback(null, node);
        }
      }
      next();
  });
};


Review.findByID = function (id, callback) {
    var qry = "MATCH (n) where id(n)="+ id + " RETURN n";
    db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, new Review(node));
  });
};

Review.getAdPhotos = function (id, isAll, callback) {    
    var qry = "start n=node(" + id + ") OPTIONAL MATCH n<-[:belongs]-(x:Images) return ID(n) as adid, n.adtitle as adtitle, n.description as description, n.address as address, n.startdate as startdate, n.enddate as enddate, n.enddate as enddate, n.status as status, n.isfeatured as isfeatured, ID(x) as photoid, x.imagename as photo order by ID(x) DESC";
    if(!isAll)
    {
      qry = "start n=node(" + id + ") OPTIONAL MATCH n<-[:belongs]-(x:Images) return ID(n) as adid, n.adtitle as adtitle, n.description as description, n.address as address, n.startdate as startdate, n.enddate as enddate, n.status as status, n.isfeatured as isfeatured, ID(x) as photoid, x.imagename as photo order by ID(x) DESC LIMIT 1";
    }    
    db.query(qry, function (err, result) {
      if (err) return callback(err);
      callback(null, result);
  });
};

Review.getAdImages = function (id,callback) {
  var arr = [];
  var qry = "start n=node("+id+") MATCH n<-[:belongs]-(x:Images) return ID(n) as adid, ID(x) as photoid, x.imagename as photo";
  db.query(qry, function (err, images) {
    if (err) return callback(err);
    if (typeof(images) === 'object' && images.length == undefined)
    {  
        arr.push(images);
        images = arr;
    } 
    callback(null, images);
  });
};

Review.publishUseAd = function (id,callback) {
  var qry = "START n=node("+id+") SET n.status = 1 RETURN n";
  db.query(qry, function(err, node) {
    if(err){console.log(err);}
    callback(null, node);
  })
};

Review.update = function (data, callback) {  
  db.save(data._node, function(err, node) {
      var review = new Review(node);
      if (err) return callback(err);
        callback(null, node);
    }); 
};

Review.getAllInformation = function (id,callback) {
  var qry = "MATCH (ad:Review)-[:belongs]->(u:User)WHERE ID(ad)="+id+" return ad,u";
  console.log("<<<<\n\n\n\n", qry , "\n\n\n\n>>>>");
  db.query(qry, function(err, node) {    
    console.log("<<<<\n\n\n\n", node , "\n\n\n\n>>>>");
    if(err){console.log(err);}
    callback(null, node);
  })
};

Review.deleteAd = function (id, callback) {
  var qry = "START n=node("+id+") MATCH n-[r]-() DELETE n, r";
  db.query(qry, function(err, result) {
    if(err){console.log(err);}
    callback(null, result);
  })
};

Review.markasfeatured = function (id, callback) {
  var qry = "START n=node("+ id +") SET n.isfeatured = 1 RETURN n";
  db.query(qry, function (err, node) {
    if (err) return callback(err); +
    callback(err);
  });
};

Review.markasunfeatured = function (id, callback) {
  var qry = "START n=node("+ id +") SET n.isfeatured = 0 RETURN n";
  db.query(qry, function (err, node) {
    if (err) return callback(err); +
    callback(err);
  });
};

Review.searchReview = function (keywords, category, location, distance,callback) {
  var arr = [];
  //var qry = " MATCH (ad:Review)-[:belongs]->(u:User)";
  var qry = " MATCH (ad:Review)-[:belongs]->(u:User)";
  if(keywords!="" || (category!="" && category !="All"))//if(keywords!="" || category!="" || category !="All" || location!="" || location!="All" || distance!="")
    qry = qry+" WHERE"
  if(keywords!="")
    qry = qry+" ad.keywords =~ '(?i).*"+ keywords + ".*'";
  if(category!="" && category!="All")
    qry = qry+" ad.category = '"+category+"'";
  // if(location!="" && location!="All")
  //   qry = qry+" ad.location = "+location;
  // if(distance!="")
  //   qry = qry+" ad.distance = "+distance;  
  qry = qry+'  return  id(ad) as adid, ad.adtitle as title,id(u) As userid,u.usertype as adtype';  
  //qry = qry+'  return  id(ad) as adId, ad.adtitle as title,id(u) As userid, u.usertype as adtype';  
  console.log("Query = ", qry);
  db.query(qry, function(err, node) {
    if (typeof(node) === 'object' && node.length == undefined)
    {  
        arr.push(node);
        node = arr;
    } 
    if(err){console.log(err);}
    callback(null, node);
  })
};

Review.getFeaturedReview = function (callback) {
  var arr = [];
  //var qry = 'MATCH (ad:Review)-[:belongs]->(u:User) MATCH ad<-[:belongs]-(i:Images) where ad.isfeatured = 1 return  id(ad) as adId, ad.adtitle as title,u.usertype as adtype, "uploads/photos/"+id(u)+"/"+id(ad)+"/"+i.imagename as imageurl';
  var qry = 'MATCH (ad:Review)-[:belongs]->(u:User) where ad.isfeatured = 1 return  id(ad) as adid, ad.adtitle as title, ad.description as description, ad.isfeatured as isfeatured, u.usertype as adtype, id(u) as userid';
  db.query(qry, function(err, node) {
    if(err){console.log(err);}
    if (typeof(node) === 'object' && node.length == undefined)
    {  
        arr.push(node);
        node = arr;
    } 
    callback(null, node);
  })
};

Review.getUser = function (id, callback) {
  var qry = "MATCH (ad:Review)-[:belongs]->(u:User) WHERE ID(ad)="+id+" return u";
  console.log("\n\nQuery = ", qry);
  db.query(qry, function(err, result) {
    if(err){console.log(err);}
    callback(null, result);
  })
};
