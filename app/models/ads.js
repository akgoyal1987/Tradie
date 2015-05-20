var assets = require("../../config/assets");
var db = require("seraph")(assets.db_url);

// private constructor:

var Ads = module.exports = function Ads(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

Ads.create = function (data,user, callback) {
  db.save(data, function(err, node) {
    var ads = new Ads(node);
    if (err) return callback(err);
    db.label(node,'Ads', function(err,ads) {
      if (err) return callback(err);
      console.log(node);
      db.relate(node.id,'belongs',user, function (err, rel) {
        callback(null, node);
      });
    });
  }); 
};


Ads.relateToCategory = function (ad,category, callback) {
  db.relate(ad,'belongs',category, function (err, rel) {
    callback(null, rel);
  }); 
};


Ads.findByID = function (id, callback) {
    var qry = "MATCH (n) where id(n)="+ id + " RETURN n";
    db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, new Ads(node));
  });
};

Ads.getAdPhotos = function (id, isAll, callback) {    
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

Ads.getAdImages = function (id,callback) {
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

Ads.publishUseAd = function (id,callback) {
  var qry = "START n=node("+id+") SET n.status = 1 RETURN n";
  db.query(qry, function(err, node) {
    if(err){console.log(err);}
    callback(null, node);
  })
};

Ads.updateAds = function (adid,callback) {
  var qry = "START n=node("+adid+") SET n.status = 2 RETURN n";
  db.query(qry, function(err, node) {
    if(err){console.log(err);}
    callback(null, node);
  })
};

Ads.updateblockAds = function (adid,callback) {
  var qry = "START n=node("+adid+") SET n.status = 1 RETURN n";
  db.query(qry, function(err, node) {
    if(err){console.log(err);}
    callback(null, node);
  })
};
Ads.update = function (data, callback) {  
  db.save(data._node, function(err, node) {
      var ads = new Ads(node);
      if (err) return callback(err);
        callback(null, node);
    }); 
};

Ads.getAllInformation = function (id,callback) {
  var qry = "MATCH (ad:Ads)-[:belongs]->(u:User)WHERE ID(ad)="+id+" return ad,u";
  db.query(qry, function(err, node) {
    if(err){console.log(err);}
    callback(null, node);
  })
};

Ads.deleteAd = function (id, callback) {
  var qry = "START n=node("+id+") MATCH n-[r]-() DELETE n, r";
  db.query(qry, function(err, result) {
    if(err){console.log(err);}
    callback(null, result);
  })
};

Ads.markasfeatured = function (id, callback) {
  var qry = "START n=node("+ id +") SET n.isfeatured = 1 RETURN n";
  db.query(qry, function (err, node) {
    if (err) return callback(err); +
    callback(err);
  });
};

Ads.markasunfeatured = function (id, callback) {
  var qry = "START n=node("+ id +") SET n.isfeatured = 0 RETURN n";
  db.query(qry, function (err, node) {
    if (err) return callback(err); +
    callback(err);
  });
};

Ads.searchAds = function (keywords, category, location, distance,callback) {
  var arr = [];
  //var qry = " MATCH (ad:Ads)-[:belongs]->(u:User)";
  var qry = " MATCH (ad:Ads)-[:belongs]->(u:User)";
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

Ads.getFeaturedAds = function (callback) {
  var arr = [];
  //var qry = 'MATCH (ad:Ads)-[:belongs]->(u:User) MATCH ad<-[:belongs]-(i:Images) where ad.isfeatured = 1 return  id(ad) as adId, ad.adtitle as title,u.usertype as adtype, "uploads/photos/"+id(u)+"/"+id(ad)+"/"+i.imagename as imageurl';
  var qry = 'MATCH (ad:Ads)-[:belongs]->(u:User) where ad.isfeatured = 1 return  id(ad) as adid, ad.adtitle as title, ad.description as description, ad.isfeatured as isfeatured, u.usertype as adtype, id(u) as userid';
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
Ads.getOneAdImage = function (id,callback) {
  var arr = [];
  var qry = "start n=node("+id+") MATCH n<-[:belongs]-(x:Images) return ID(n) as adid, ID(x) as photoid, x.imagename as photo limit 1";
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

Ads.findSpamAds = function (callback) {
  var arr = [];
  //var qry = 'MATCH (ad:Ads)-[:belongs]->(u:User) MATCH ad<-[:belongs]-(i:Images) where ad.isfeatured = 1 return  id(ad) as adId, ad.adtitle as title,u.usertype as adtype, "uploads/photos/"+id(u)+"/"+id(ad)+"/"+i.imagename as imageurl';
  var qry = "MATCH (ad:Ads)-[:belongs]->(u:User) where ad.keywords =~ '(?i).*Fuck.*' or ad.keywords =~ '(?i).*Shit.*' or ad.keywords =~ '(?i).*Arsehole.*' or ad.keywords =~ '(?i).*Jackarse .*' or ad.keywords =~ '(?i).*xxx.*' or ad.keywords =~ '(?i).*sex.*' or ad.adtitle =~ '(?i).*Fuck.*' or ad.adtitle =~ '(?i).*Shit.*' or ad.adtitle =~ '(?i).*Arsehole.*' or ad.adtitle =~ '(?i).*Jackarse .*' or ad.adtitle =~ '(?i).*xxx.*' or ad.adtitle =~ '(?i).*sex.*' or ad.description =~ '(?i).*Fuck.*' or ad.description =~ '(?i).*Shit.*' or ad.description =~ '(?i).*Arsehole.*' or ad.description =~ '(?i).*Jackarse .*' or ad.description =~ '(?i).*xxx.*' or ad.description =~ '(?i).*sex.*' or ad.contactname =~ '(?i).*Fuck.*' or ad.contactname =~ '(?i).*Shit.*' or ad.contactname =~ '(?i).*Arsehole.*' or ad.contactname =~ '(?i).*Jackarse .*' or ad.contactname =~ '(?i).*xxx.*' or ad.contactname =~ '(?i).*sex.*' or ad.slogan =~ '(?i).*Fuck.*' or ad.slogan =~ '(?i).*Shit.*' or ad.slogan =~ '(?i).*Arsehole.*' or ad.slogan =~ '(?i).*Jackarse .*' or ad.slogan =~ '(?i).*xxx.*' or ad.slogan =~ '(?i).*sex.*' or ad.accrediation =~ '(?i).*Fuck.*' or ad.accrediation =~ '(?i).*Shit.*' or ad.accrediation =~ '(?i).*Arsehole.*' or ad.accrediation =~ '(?i).*Jackarse .*' or ad.accrediation =~ '(?i).*xxx.*' or ad.accrediation =~ '(?i).*sex.*' or ad.abn =~ '(?i).*Fuck.*' or ad.abn =~ '(?i).*Shit.*' or ad.abn =~ '(?i).*Arsehole.*' or ad.abn =~ '(?i).*Jackarse .*' or ad.abn =~ '(?i).*xxx.*' or ad.abn =~ '(?i).*sex.*' or ad.areaofexpertise =~ '(?i).*Fuck.*' or ad.areaofexpertise =~ '(?i).*Shit.*' or ad.areaofexpertise =~ '(?i).*Arsehole.*' or ad.areaofexpertise =~ '(?i).*Jackarse .*' or ad.areaofexpertise =~ '(?i).*xxx.*' or ad.areaofexpertise =~ '(?i).*sex.*' return  id(ad) as adid, ad.adtitle as title, ad.description as description, ad.isfeatured as isfeatured, u.usertype as adtype, id(u) as userid";
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

Ads.deleteAdWithImages = function (id, callback) {
  var qry = "MATCH (img:Images)-[r1:belongs]->(ad:Ads)-[r2:belongs]->(u:User)WHERE ID(ad)="+id+" Delete img,r1,ad,r2";
  console.log("\n\nspam Add Deletion Query = ", qry);
  db.query(qry, function(err, result) {
    if(err){console.log(err);}
    callback(null, result);
  })
};

Ads.getUser = function (id, callback) {
  var qry = "MATCH (ad:Ads)-[:belongs]->(u:User) WHERE ID(ad)="+id+" return u";
  console.log("\n\nQuery = ", qry);
  db.query(qry, function(err, result) {
    if(err){console.log(err);}
    callback(null, result);
  })
};

Ads.isRecommended = function(adid, userid, callback)
{
  var arr = [];
  var qry = "start n=node("+userid+") match n-[r:recommendations]->(ad) WHERE ID(ad) = "+ adid +" return ad";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, node);
  });
}

Ads.markasrecommended = function (adid, userid, callback) {
  db.relate(userid,'recommendations', adid, function (err, rel) {
    callback(err);
  });
};

Ads.recommendadtouser = function (adid, userid,targeruserid, callback) {
  db.relate(userid,'recommendations', adid,{ targetuser : targeruserid}, function (err, rel) {
    callback(err, rel);
  });
};

Ads.saveReply = function (adid, userid,description, callback) {
  db.relate(userid,'replies', adid,{ description : description, date : new Date()}, function (err, reply) {
    callback(err, reply);
  });
};

Ads.getAllRecommendations = function (adid,userid, callback) {
  var qry = "MATCH (u:User) -[r:recommendations]->(ad:Ads) where id(u) = "+userid+" and id(ad) = "+adid+" return r.targetuser";
  db.query(qry, function (err, results) {
    callback(err, results);
  });
};

Ads.getAllReplies = function (adid, callback) {
  var qry = "MATCH (user:User)-[reply:replies]->(ad:Ads) WHERE ID(ad) = " + adid + " return user,reply";
  console.log(qry);
  db.query(qry, function (err, results) {
    callback(err, results);
  });
};

Ads.markasunrecommended = function (adid, userid, callback) {
  var qry = "start n=node("+userid+") match n-[r:recommendations]->(ad) WHERE ID(ad) = "+ adid + " delete r";
  db.query(qry, function (err, result) {
    callback(err);
  });
};

Ads.getRecommendationCount = function (adid, callback) {
  var qry = "MATCH (ad:Ads)<-[:recommendations]-(u:User) WHERE ID(ad) = " + adid + " return u";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, node);
  });
};

Ads.getAllAds = function (callback) {
 
  //var qry = 'MATCH (ad:Ads)-[:belongs]->(u:User) MATCH ad<-[:belongs]-(i:Images) where ad.isfeatured = 1 return  id(ad) as adId, ad.adtitle as title,u.usertype as adtype, "uploads/photos/"+id(u)+"/"+id(ad)+"/"+i.imagename as imageurl';
  var qry = "MATCH (ad:Ads)-[:belongs]->(u:User) where u.usertype='tradesman' return ad";
  db.query(qry, function (err, results) {
    console.log(qry);
    callback(err, results);
  });
};

Ads.getCategory = function (id,callback) {
  var arr = [];
  var qry = "start n=node("+id+") MATCH n-[:belongs]->(c:Category) return c";
  console.log(qry);
  db.query(qry, function (err, category) {
    if (err) return callback(err);
    if (typeof(category) === 'object' && category.length == undefined)
    {  
        arr.push(category);
        category = arr;
    } 
    callback(null, category);
  });
};