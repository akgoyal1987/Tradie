var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , User = require('../models/user')
  , Pages = require('../models/pages')
  , Usertypes = require('../models/usertypes')
  , Category = require('../models/Category')
  , Ads = require('../models/ads')
  , User = require('../models/user')
  ,Replyusers=require('../models/replyusers')
  , fs    = require("fs")
  , path = require('path')
  ,pages_
  ;

var usersController = new Controller();

usersController.before('*', function(next){
  Pages.getAll(function(err, data){
    console.log("\n\n\n\npages=",data);
    pages_ = data;
    next();
  });
  });
usersController.previewuserad = function() {
  var req = this.req;
  this.render({user:req.user});
}
usersController.previewuserad1 = function() {
  var req = this.req;
  this.render({user:req.user,pages : pages_});
}
usersController.userad = function() {
  var req = this.req;
  User.getUserAds(req.user.id,function (err, ads) {
    console.log("ads",ads);
  });
  this.render({user:req.user,pages : pages_});
}
usersController.index = function() {
	var req = this.req;
	var res = this.res;
  var th = this;
  var userdata = new Object();
  userdata.user = req.user; 
  userdata.adcount = 0;
  userdata.followingcount = 0;
  userdata.followercount = 0;
  userdata.recommendationcount = 0;
  userdata.watchlistcount = 0;
  req.user.adcount = 0;
  req.user.followingcount = 0;
  req.user.followercount = 0;
  req.user.recommendationcount = 0;
  req.user.watchlistcount = 0;
  User.getActivityCounts(req.user.id,function (err, results) {
    if(results.length > 0)
    {
      userdata.followingcount = results[0].followingcount;      
      userdata.followercount = results[0].followercount;      
      userdata.recommendationcount = results[0].recommendationcount;
      userdata.watchlistcount = results[0].watchlistcount;
      req.user.followingcount = results[0].followingcount;
      req.user.followercount = results[0].followercount;
      req.user.recommendationcount = results[0].recommendationcount;      
      req.user.watchlistcount = results[0].watchlistcount;
    } 
    User.getUserAds(req.user.id,function (err, ads) {
      var i =-1;
      var next = function() {
          i++;   
          if (i < ads.length) {  
            Ads.getAdPhotos(ads[i].adid, false, function(err,ad){ 
              ads[i].ad = ad;              
              next();    
            });             
          }
          else
          { 
            userdata.adcount = ads.length; 
            userdata.ads = ads;
            req.user.adcount = ads.length;
            req.user.ads = ads;
            th.render('index',{user:req.user, data : userdata,pages : pages_});  
          }
      }  
      next();
    });        
  }); 
}

usersController.getProfile = function()
{
  var req = this.req;
  var res = this.res;
  var th = this;
  var id = req.param('id');
  var userdata = new Object();
  if(id != undefined)
  {
    User.findByID(id, function(err,usr){ 
      userdata.user = usr._node[0];
      userdata.adcount = 0;
      userdata.followingcount = 0;
      userdata.followercount = 0;
      userdata.recommendationcount = 0;
      userdata.watchlistcount = 0;
      User.getActivityCounts(id,function (err, results) {
        if(results.length > 0)
        { 
          userdata.followingcount = results[0].followingcount;      
          userdata.followercount = results[0].followercount;      
          userdata.recommendationcount = results[0].recommendationcount;
          userdata.watchlistcount = results[0].watchlistcount;
        }
        User.getUserAds(id,function (err, ads) {
          var i =-1;
          var next = function() {
              i++;   
              if (i < ads.length) {  
                Ads.getAdPhotos(ads[i].adid, false, function(err,ad){ 
                  ads[i].ad = ad;
                  ads[i].ad.isWatched = 0;
                  ads[i].ad.isRecommended = 0;
                  User.isAdWatched(req.user.id, ads[i].adid, function(err, ad){     
                    if(ad && ad.length > 0)
                    {
                      ads[i].ad.isWatched = 1;
                    }                    
                    Ads.isRecommended(ads[i].adid, req.user.id, function(err, recad){  
                      if(recad && recad.length > 0)
                      {
                        ads[i].ad.isRecommended = 1;
                      }                    
                    next();    
                  });            
                });             
                });             
              }
              else
              { 
                userdata.adcount = ads.length; 
                userdata.ads = ads;
                th.render('index',{user : req.user, data : userdata,pages : pages_});  
              }
          }  
          next();             
        });
      });
    });
  }
}

usersController.people = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var type = (req.param('type') == undefined ? "all" : req.param('type'));
  var search = (req.param('search') == undefined ? "" : req.param('search'));
  var usr_arr = []
  User.getAll(type,search,function (err, users) {
    if (err) res.json(err); 
    if (typeof(users) === 'object' && users.length == undefined)
    {  
        usr_arr.push(users);
        users = usr_arr;
    }       
    User.getFollowingAndOthers(req.user,function (err, relationships) {
      User.getTop5MostFollowers(function (err, topfollowers) {      
        Ads.getAllAds(function(err,ads){
       Category.getAllCategories(function(err, categories){    
        th.render('people', {users: users, user:req.user, relationships:relationships, mostfollowers : topfollowers, search: search,pages : pages_,categories:categories,data:ads});
      });
    }); 
      });      
    });
  });
}

usersController.follow = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.param('id');
  User.follow(id,req.user.id, function (err) {
    if (err) console.log(err);
    res.redirect('back');
  });      
}

usersController.unfollow = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.param('id');

  User.unfollow(id, function (err) {
    if (err) console.log(err);
    res.redirect('back');
  });      
}

usersController.following = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var userdata = new Object();
  var id = req.param('id');
  userdata.adcount = 0;
  userdata.followingcount = 0;
  userdata.followercount = 0;
  userdata.recommendationcount = 0;
  userdata.watchlistcount = 0;
  if(id != undefined)
  {    
    User.getFollowings(id,function (err, followings) {
    var i =-1;
      var next = function() {
        i++;   
        if (i < followings.length) {             
          User.findByID(followings[i].end, function(err,usr1){ 
            followings[i].user = usr1._node[0];
            User.getActivityCounts(followings[i].end,function (err, results) {
              if(results.length > 0)
              { 
                followings[i].user.followings = results[0].followingcount;      
                followings[i].user.followers = results[0].followercount;      
                followings[i].user.recommendations = results[0].recommendationcount;
              }
                next();
              });
            });                
        }
        else
        {  
          User.findByID(id, function(err,usr){ 
            userdata.user = usr._node[0];
              User.getActivityCounts(id,function (err, results) {
              if(results.length > 0)
              { 
                userdata.followingcount = results[0].followingcount;      
                userdata.followercount = results[0].followercount;      
                userdata.recommendationcount = results[0].recommendationcount;
                userdata.watchlistcount = results[0].watchlistcount;
              }
              User.getUserAds(id,function (err, userads) {
                userdata.adcount = userads.length;                  
                th.render('following',{user: req.user, data : userdata, results : followings,pages : pages_});
              });
            });
          });  
        }
      }  
      next();    
    }); 
  }
  else
  {
     th.render('following',{user:req.user, results : []});  
  } 
}

usersController.follower = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var userdata = new Object();
  var id = req.param('id');
  userdata.adcount = 0;
  userdata.followingcount = 0;
  userdata.followercount = 0;
  userdata.recommendationcount = 0;
  userdata.watchlistcount = 0;
  if(id != undefined)
  {
    User.getFollowers(id,function (err, followers) {
      var i =-1;
      var next = function() {
        i++;   
        if (i < followers.length) {  
          User.findByID(followers[i].start, function(err,usr){ 
            followers[i].user = usr._node[0];
            User.getActivityCounts(followers[i].start,function (err, results) {
              if(results.length > 0)
              { 
                followers[i].user.followings = results[0].followingcount;      
                followers[i].user.followers = results[0].followercount;      
                followers[i].user.recommendations = results[0].recommendationcount;
              }
                next();     
              });
            });                
        }
        else
        {  
          User.findByID(id, function(err,usr){ 
            userdata.user = usr._node[0];
              User.getActivityCounts(id,function (err, results) {
              if(results.length > 0)
              { 
                userdata.followingcount = results[0].followingcount;      
                userdata.followercount = results[0].followercount;      
                userdata.recommendationcount = results[0].recommendationcount;
                userdata.watchlistcount = results[0].watchlistcount;
              }
              User.getUserAds(id,function (err, userads) {
                userdata.adcount = userads.length;                       
                th.render('follower',{user:req.user, data : userdata, results : followers,pages : pages_});  
              });              
            });
          }); 
        }
      }  
      next();    
    }); 
  }
  else
  {
    th.render('follower',{user:req.user, results : []});   
  }   
}

usersController.logintype = function() {
 var req = this.req;
 Ads.getAllAds(function(err,ads){
Category.getAllCategories(function(err, categories){  
 this.render({user:req.user,pages : pages_,data:ads,categories:categories});
});
  });
}


usersController.saveusertypeads = function() {
  var req = this.req;
  var res = this.res; 
  User.setUsertype(req.user.id, req.body.user, function (err) {
    if (err) console.log(err);
    req.user.usertype = req.body.user;
    res.redirect('/users');
  });
}

usersController.publishAd = function()
{
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.param("id");
  User.publishAd(id,function (err, ad) {
      if(ad._node[0].status == 1)
      {
        res.send({success : true});
      }
      else
      {
        res.send({success : false});
      }
  });
}

usersController.unpublishAd = function()
{
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.param("id");
  User.unpublishAd(id,function (err, ad) {
      if(ad._node[0].status == 0)
      {
        res.send({success : true});
      }
      else
      {
        res.send({success : false});
      }
  });
}

usersController.deleteAd = function()
{
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.param("id");
  var pg = req.param("pg");
  Ads.deleteAd(id,function (err, result) {
    res.redirect('/users');
  });
}

usersController.addtowatchlist= function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.param('id');
  User.addtowatchlist(id, req.user.id, function (err) {
    if (err) 
    {
        console.log(err);
        res.send({success : false});
    }
    else
    { 
        res.send({success : true});
    }
  });      
}

usersController.removefromwatchlist= function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.param('id');
  User.removeadfromwatchlist(id, req.user.id, function (err) {
    if (err) 
    {
        console.log(err);
        res.send({success : false});
    }
    else
    { 
        res.send({success : true});
    }
  });      
}

usersController.getrecommendations = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var userdata = new Object();
  var id = req.param('id');
  userdata.adcount = 0;
  userdata.followingcount = 0;
  userdata.followercount = 0;
  userdata.recommendationcount = 0;
  userdata.watchlistcount = 0;
  if(id != undefined)
  {
    User.getRecommendations(id,function (err, recommendations) {
      var i =-1;
      var next = function() {
        i++;   
        if (i < recommendations.length) {
          Ads.getAdPhotos(recommendations[i].adid, false, function(err,ad){ 
            recommendations[i].ad = ad;
            recommendations[i].ad.isRecommended = 0;
            recommendations[i].ad.recommendationCount = 0;
            Ads.getRecommendationCount(recommendations[i].adid, function(err, recadcount){  
              if(recadcount && recadcount.length > 0)
              {
                recommendations[i].ad.recommendationCount = recadcount.length;
              }
              Ads.isRecommended(recommendations[i].adid, req.user.id, function(err, recad){  
                if(recad && recad.length > 0)
                {
                  recommendations[i].ad.isRecommended = 1;
                }                    
            next();                
          });      
            });                          
          });      
        }
        else
        {  
          User.findByID(id, function(err,usr){ 
            userdata.user = usr._node[0];
            User.getActivityCounts(id,function (err, results) {
              if(results.length > 0)
              { 
                userdata.followingcount = results[0].followingcount;      
                userdata.followercount = results[0].followercount;      
                userdata.recommendationcount = results[0].recommendationcount;
                userdata.watchlistcount = results[0].watchlistcount;
              }
              User.getUserAds(id,function (err, userads) {
                userdata.adcount = userads.length;                     
                th.render('recommendation',{user:req.user, data : userdata, results : recommendations,pages : pages_});  
              });
            });
          }); 
        }
      }  
      next();    
    }); 
  }
  else
  {
    th.render('recommendation',{user:req.user, results : []});   
  }   
}

usersController.getwatchlist = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var userdata = new Object();
  var id = req.param('id');
  userdata.adcount = 0;
  userdata.followingcount = 0;
  userdata.followercount = 0;
  userdata.recommendationcount = 0;
  userdata.watchlistcount = 0;
  if(id != undefined)
  {
    User.getWatchlists(id,function (err, watchlists) {
      var i =-1;
      var next = function() {
        i++;   
        if (i < watchlists.length) {
          Ads.getAdPhotos(watchlists[i].adid, false, function(err,ad){ 
            watchlists[i].ad = ad;
            watchlists[i].ad.isWatched = 0;
            User.isAdWatched(req.user.id, watchlists[i].adid, function(err, ad){     
              if(ad && ad.length > 0)
              {
                watchlists[i].ad.isWatched = 1;
              }                    
              next();    
            });                            
          });      
        }
        else
        {  
          User.findByID(id, function(err,usr){ 
            userdata.user = usr._node[0];
              User.getActivityCounts(id,function (err, results) {
                if(results.length > 0)
                { 
                  userdata.followingcount = results[0].followingcount;      
                  userdata.followercount = results[0].followercount;      
                  userdata.recommendationcount = results[0].recommendationcount;
                  userdata.watchlistcount = results[0].watchlistcount;
                }
                User.getUserAds(id,function (err, userads) {
                  userdata.adcount = userads.length;                    
                  th.render('watchlist',{user:req.user, data : userdata, results : watchlists,pages : pages_});  
                });
              });
          }); 
        }
      }  
      next();    
    }); 
  }
  else
  {
    th.render('watchlist',{user:req.user, results : []});   
  }   
}


usersController.registeruser = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  delete req.body.cpassword;
  var fullDate = new Date();//Thu May 19 2011 17:25:38 GMT+1000 {}
  var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1);
  var currentDate =  fullDate.getFullYear() + "/" + twoDigitMonth + "/" + fullDate.getDate();
  var object = new Object();
  req.body.createddate = currentDate;
  User.find(req.body, function(err,usr){
    if(usr && usr._node[0]){
      message = "Email alreay register. Please try another email.";
      th.render("pages/register", {user:req.user, message : message, data : req.body,pages : pages_})
    }
    else
    {
  User.create(req.body, function (err, new_usr) {
      if (err){console.log(err);}
      if(req.files.pic_1.size){
        var user_folder_path = path.resolve(__dirname + "../../../public/uploads/photos/"+new_usr.id);
        if(!fs.existsSync(user_folder_path)){
          fs.mkdirSync(user_folder_path);
        }        
        fs.readFile(req.files.pic_1.path, function (err, data) {
          var imageName = req.files.pic_1.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "user_"+new_usr.id+extention;
          fs.writeFile(user_folder_path+"/"+pic, data, function (err) { 
              var photourl = path.resolve("uploads/photos/"+new_usr.id+"/"+pic);
              photourl = encodeURIComponent(photourl);
              User.setPhotourl(new_usr.id, "/uploads/photos/"+new_usr.id+"/"+pic, function(err, usr){
                if(err){console.log(err);}
                res.redirect('/');
              });              
          });  
        }); 
      }       
  });
}
  });
}

usersController.editprofile = function() {
  var req = this.req;
  var th = this;
  var userdata = new Object();
  userdata.user = req.user; 
  userdata.adcount = 0;
  userdata.followingcount = 0;
  userdata.followercount = 0;
  userdata.recommendationcount = 0;
  userdata.watchlistcount = 0;
  req.user.adcount = 0;
  req.user.followingcount = 0;
  req.user.followercount = 0;
  req.user.recommendationcount = 0;
  req.user.watchlistcount = 0;
  User.getActivityCounts(req.user.id,function (err, results) {
    if(results.length > 0)
    {
      userdata.followingcount = results[0].followingcount;      
      userdata.followercount = results[0].followercount;      
      userdata.recommendationcount = results[0].recommendationcount;
      userdata.watchlistcount = results[0].watchlistcount;
      req.user.followingcount = results[0].followingcount;
      req.user.followercount = results[0].followercount;
      req.user.recommendationcount = results[0].recommendationcount;      
      req.user.watchlistcount = results[0].watchlistcount;
    } 
    User.getUserAds(req.user.id,function (err, ads) {
      var i =-1;
      var next = function() {
          i++;   
          if (i < ads.length) {  
            Ads.getAdPhotos(ads[i].adid, false, function(err,ad){ 
              ads[i].ad = ad;              
              next();    
            });             
          }
          else
          { 
            userdata.adcount = ads.length; 
            userdata.ads = ads;
            req.user.adcount = ads.length;
            req.user.ads = ads;
            th.render({user:req.user, data : userdata,pages : pages_});  
            // th.render({user:req.user,pages : pages_});
          }
      }  
      next();
    });        
  });             
}

module.exports = usersController;
