// user.js
// User model logic.

var assets = require("../../config/assets");
var db = require("seraph")(assets.db_url);
console.log("DB_URL ="+assets.db_url);
// constants:

var INDEX_NAME = 'nodes';
var INDEX_KEY = 'type';
var INDEX_VAL = 'user';
var FOLLOWS_REL = 'follows';

// private constructor:

var User = module.exports = function User(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

// public instance properties:

Object.defineProperty(User.prototype, 'id', {
    get: function () { return this._node.id; }
});

Object.defineProperty(User.prototype, 'exists', {
    get: function () { return this._node.exists; }
});

Object.defineProperty(User.prototype, 'name', {
    get: function () {
        return this._node.data['name'];
    },
    set: function (name) {
        this._node.data['name'] = name;
    }
});
// newly add code
Object.defineProperty(User.prototype, 'pic', {
    get: function () {
        return this._node.data['pic'];
    },
    set: function (pic) {
        this._node.data['pic'] = pic;
    }
});
    
Object.defineProperty(User.prototype, 'userid', {
    get: function () {
        return this._node.data['userid'];
    },
    set: function (userid) {
        this._node.data['userid'] = userid;
    }
});

Object.defineProperty(User.prototype, 'provider', {
    get: function () {
        return this._node.data['provider'];
    },
    set: function (provider) {
        this._node.data['provider'] = provider;
    }
});

Object.defineProperty(User.prototype, 'email', {
    get: function () {
        return this._node.data['email'];
    },
    set: function (email) {
        this._node.data['email'] = email;
    }
});

// private instance methods:

User.prototype._getFollowingRel = function (other, callback) {
    var query = [
        'START user=node({userId}), other=node({otherId})',
        'OPTIONAL MATCH (user) -[rel:FOLLOWS_REL]-> (other)',
        'RETURN rel'
    ].join('\n')
        .replace('FOLLOWS_REL', FOLLOWS_REL);

    var params = {
        userId: this.id,
        otherId: other.id,
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var rel = results[0] && results[0]['rel'];
        callback(null, rel);
    });
};

// public instance methods:

User.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

User.prototype.del = function (callback) {
    this._node.del(function (err) {
        callback(err);
    }, true);   // true = yes, force it (delete all relationships)
};

User.unfollow = function (other, user, callback) {
  var qry = "start n=node("+user+") match n-[r:follows]->(ad) WHERE ID(ad) = "+ adid + " delete r";
  db.query(qry, function (err, result) {
    callback(err);
  });  
};

User.follow = function (other,user, callback) {
  db.relate(user,'follows',other, function (err, rel) {
    callback(err);
  });
};

User.getFollowingAndOthers = function (user,callback) {
  db.relationships(user.id, 'out', 'follows', function(err, relationships) {   
    callback(null, relationships);
  });
};

User.getActivityCounts = function(id, callback)
{
  var arr = [];
  var qry = "start n=node("+id+") OPTIONAL MATCH n-[:follows]->(followings) OPTIONAL MATCH n<-[:follows]-(followers) OPTIONAL MATCH n-[:recommendations]->(recommendation) OPTIONAL MATCH n-[:watchlists]->(watchlist) return n.name AS name, n.photourl AS photourl, n.usertype AS usertype, count(distinct followers) as followercount, count(distinct followings) as followingcount, count(distinct recommendation) as recommendationcount,count(distinct watchlist) as watchlistcount";
  db.query(qry, function (err, result) {
      if (err) return callback(err);      
      if (typeof(result) === 'object' && result.length == undefined)
      {  
          arr.push(result);
          result = arr;
      } 
      callback(null, result);
  });
};

User.getTop5MostFollowers = function (callback) {
  var qry = "start n=node(*) match n-[:follows]->() return n.name AS name, n.photourl AS photourl, n.usertype AS usertype, count(*) as followercount ORDER BY followercount limit 5";
  db.query(qry, function (err, result) {
      if (err) return callback(err);
      callback(null, result);
  });
};

User.getFollowings = function (id,callback) {
  var arr = [];
  db.relationships(id, 'out', 'follows', function(err, relationships) { 
    if (typeof(relationships) === 'object' && relationships.length == undefined)
    {  
        arr.push(relationships);
        relationships = arr;
    }  
    callback(null, relationships);
  });
};

User.getFollowers = function (id,callback) {
  var arr = [];
  db.relationships(id, 'in', 'follows', function(err, relationships) {   
    if (typeof(relationships) === 'object' && relationships.length == undefined)
    {  
        arr.push(relationships);
        relationships = arr;
    }
    callback(null, relationships);
  });
};

User.getUserAds = function (id,callback) {
  var arr = [];
  var qry = "start n=node(" + id + ") match n<-[r:belongs]-(x) return ID(n) as id, n.name AS name, n.photourl AS photourl, n.usertype AS usertype, ID(x) AS adid order by ID(x) DESC";
  db.query(qry, function (err, result) {
      if (err) return callback(err);
      if (typeof(result) === 'object' && result.length == undefined)
      {  
          arr.push(result);
          result = arr;
      } 
      callback(null, result);
  });
};


User.setUsertype = function(id, type,callback)
{
  var qry = "START n=node("+ id +") SET n.usertype = '"+ type +"' RETURN n";
  db.query(qry, function (err, node) {
    if (err) return callback(err); +
    callback(null, new User(node));
  });

}

User.getUserType = function (user,callback) {
  db.relationships(user.id, 'out', 'usertype', function(err, relationships) { 
    callback(null, relationships);
  });
};

// static methods:
User.get = function (id, callback) {
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        callback(null, new User(node));
    });
};

User.findByID = function (id, callback) {
    var qry = "MATCH (n) where id(n)="+ id + " RETURN n";
    db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, new User(node));
  });
};

User.find = function (user, callback) {
  var qry = ""; 
  qry = "MATCH (n) where n.email=\'"+user.email+"\' RETURN n";  
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, new User(node));
  });
};

User.findByName = function (user, callback) {
  var qry = "MATCH (n) where (n.name=\'"+user.username+"\' or n.email=\'"+user.username+"\') and n.password=\'"+user.password+"\' RETURN n";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, new User(node));
  });
};

User.getAll = function (type, search, callback) {
    var arr = [];
    var qry = "start n=node(*) where has(n.name) and (n.usertype <> 'superadmin' AND n.usertype <> 'admin') and n.name =~ '(?i).*"+ search + ".*' return ID(n) as id,n.name as name, n.photourl as photourl, n.usertype as usertype";
    if(type == "tradesman") 
    {
      qry = "start n=node(*) where has(n.name) and n.usertype = 'tradesman' and n.name =~ '(?i).*"+ search + ".*' return ID(n) as id,n.name as name,n.photourl as photourl, n.usertype as usertype";
    }
    else if(type == "user")
    {
      qry = "start n=node(*) where has(n.name) and n.usertype = 'user' and n.name =~ '(?i).*"+ search + ".*' return ID(n) as id,n.name as name,n.photourl as photourl, n.usertype as usertype";
    }

    db.query(qry, function (err, result) {   
      if (typeof(result) === 'object' && result.length == undefined)
      {  
          arr.push(result);
          result = arr;
      } 
      
      var i =-1;
      var next = function() {
          i++;          
          if (i < result.length) {    
            User.getActivityCounts(result[i].id,function (err, results) {
              if(results.length > 0)
              { 
                result[i]["followings"]  = results[0].followingcount;      
                result[i]["followers"] = results[0].followercount;      
                result[i]["recommendations"] = results[0].recommendationcount;
              }
                next();
              });               
          }
          else
          {            
            callback(null,  result);
          }
      }  
      next();
    });      
};

User.getAllByType = function (type, callback) {
    var arr = [];
    var qry;
    if(type == "tradesman") 
    {
      qry = "match (u:User) where has(u.name) and u.usertype = 'tradesman' return u";
    }
    else if(type == "user")
    {
      qry = "match (u:User) where has(u.name) and u.usertype = 'user' return u";
    }
    db.query(qry, function (err, results) {   
      if (typeof(results) === 'object' && results.length == undefined)
      {  
          arr.push(results);
          results = arr;
      } 
        callback(null, results);
    });      
};

User.getAllRecommendations = function (adid, userid, callback) {
    var arr = [];
    var qry = "match (u:User) -[r:recommendations]->(ad:ads) where id(ad) = "+adid+" and id(u) = "+userid+" return r";
  
    db.query(qry, function (err, results) {
      if (typeof(results) === 'object' && results.length == undefined)
      {  
          arr.push(results);
          results = arr;
      } 
        callback(null, results);
    });      
};

User.publishAd = function (id, callback) {
  var qry = "START n=node("+ id +") SET n.status = 1 RETURN n";
  db.query(qry, function (err, node) {
    if (err) return callback(err);
    callback(null, new User(node));
  });
};

User.blockAd = function (id, callback) {
  var qry = "START n=node("+ id +") SET n.status = 1 RETURN n";
  db.query(qry, function (err, node) {
    if (err) return callback(err);
    callback(null, new User(node));
  });
};

User.unpublishAd = function (id, callback) {
  var qry = "START n=node("+ id +") SET n.status = 0 RETURN n";
  db.query(qry, function (err, node) {
    if (err) return callback(err);
    callback(null, new User(node));
  });
};

// creates the user and persists it to the db, incl. indexing it:
User.create = function (data, callback) {
  db.save(data, function(err, node) {
    var user = new User(node);
    if (err) return callback(err);
      db.label(node,'User', function(err,user) {
        if (err) return callback(err);
        callback(null,node);
      });
  }); 
};	

User.recommendAd = function (adid, userid, callback) {
  db.relate(userid,'recommendations', adid, function (err, rel) {
    callback(err);
  });
};

User.unrecommendAd = function (adid, userid, callback) {
  var qry = "start n=node("+userid+") match n-[r:recommendations]->(ad) WHERE ID(ad) = "+ adid + " delete r";
  db.query(qry, function (err, result) {
    callback(err);
  });
};


User.addtowatchlist = function (adid, userid, callback) {
  db.relate(userid,'watchlists', adid, function (err, rel) {
    callback(err);
  });
};

User.removeadfromwatchlist = function (adid, userid, callback) {
  var qry = "start n=node("+userid+") match n-[r:watchlists]->(ad) WHERE ID(ad) = "+ adid + " delete r";
  db.query(qry, function (err, result) {
    callback(err);
  });
};

User.getRecommendations = function (id,callback) {
  var arr = [];
  var qry = "start n=node("+id+") match n-[r:recommendations]->(ad) MATCH ad-[:belongs]->(u:User) return ID(n) as id, n.name AS name, n.photourl AS photourl, n.usertype AS usertype, ID(ad) AS adid, ID(u) AS uid, u.usertype as utype order by adid DESC";
  db.query(qry, function (err, result) {
      if (err) return callback(err);
      if (typeof(result) === 'object' && result.length == undefined)
      {  
          arr.push(result);
          result = arr;
      } 
      callback(null, result);
  });
};

User.getWatchlists = function (id,callback) {
  var arr = [];
  var qry = "start n=node("+id+") match n-[r:watchlists]->(ad) MATCH ad-[:belongs]->(u:User) return ID(n) as id, n.name AS name, n.photourl AS photourl, n.usertype AS usertype, ID(ad) AS adid, ID(u) AS uid, u.usertype as utype order by adid DESC";
  db.query(qry, function (err, result) {
      if (err) return callback(err);
      if (typeof(result) === 'object' && result.length == undefined)
      {  
          arr.push(result);
          result = arr;
      } 
      callback(null, result);
  });
};

User.isAdWatched = function(uid,adid,callback)
{
  var arr = [];
  var qry = "start n=node("+uid+") match n-[r:watchlists]->(ad) WHERE ID(ad) = "+adid+" return ad";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, node);
  });
}


User.setRecommendation = function(id,recommendation,callback)
{
  var qry = "MATCH (u:User) where id(u) = "+id+" set u.recommended = '"+recommendation+"' RETURN u";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, node);
  });
}

User.setPhotourl = function(id,photourl,callback)
{
  var qry = "MATCH (u:User) where id(u) = "+id+" set u.photourl = '"+photourl+"' RETURN u";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      callback(null, node);
  });
}
