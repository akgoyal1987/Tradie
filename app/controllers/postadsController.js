
var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , Ads = require('../models/ads')
  , Pages = require('../models/pages')
  , Review = require('../models/review')
  , Photos = require('../models/photo')
  , User = require('../models/user')
  , Category = require('../models/category')
  , fs    = require("fs")
  , path = require('path')
  ,pages_
  , mapkey
  ;
if(__dirname.indexOf("vhosts")>0){
  mapkey = "AIzaSyCK5GFWPItW7WOsS7BlnOg1YSJ35AHPkfo";
}else{
  mapkey = "AIzaSyDC6Vpfktcbr85OBTG1jN2wAtiMYaWSlCs";
}

var postadsController = new Controller();

postadsController.before('*', function(next){
  Pages.getAll(function(err, data){
    pages_ = data;
    next();
  });
  });

      
 
postadsController.findservice = function() {
  var req = this.req;
  var res = this.res;
  var th = this;
  var ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  if(ip && ip.trim()=="127.0.0.1"){
    ip = "117.218.182.86";
  }
  var userdata = new Object();  
  if(req.user)
  {
    userdata.user = req.user;
    userdata.followings = req.user.followings;
    userdata.followers = req.user.followers;
    userdata.adsCount = req.user.adsCount;
    userdata.ads = req.user.ads;
    th.render({ user:req.user, data : userdata, ip:ip, mapkey : mapkey,pages : pages_});     
  }
  else
  {
    this.res.redirect('/');
  }
}


postadsController.userad= function() {
  var req = this.req;
  this.render({user:req.user});
}

//Controllers Related TO BusinessAd

postadsController.createbusinessad = function() {

  var req = this.req;
  var res = this.res;
  var th = this;
  var ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  if(ip && ip.trim()=="127.0.0.1"){
    ip = "117.218.182.86";
  }
  var userdata = new Object();
  
  if(req.user)
  {
    userdata.user = req.user;
    userdata.followings = req.user.followings;
    userdata.followers = req.user.followers;
    userdata.adsCount = req.user.adsCount;
    userdata.ads = req.user.ads;
   th.render({ user:req.user, data : userdata, ip:ip, mapkey : mapkey, pages : pages_}); 
  }
  else
  {
    this.res.redirect('/');
  }
}

postadsController.savebusinessad = function() {
  var req = this.req;
  var res = this.res;
  var fullDate = new Date();//Thu May 19 2011 17:25:38 GMT+1000 {}
  var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1);
  var currentDate = fullDate.getFullYear() + "/" + twoDigitMonth + "/" + fullDate.getDate();
  var adcategory = req.body.category;
  req.body.createddate = currentDate;
  delete req.body.category;
  Category.findByCategoryName(adcategory, function(err, category){
    if(category.length==0){
      Category.create(adcategory, function(err, category){        
        Ads.create(req.body, req.user.id, function (err, node) {
          if (err) console.log(err);
          Ads.relateToCategory(node, category, function(err, rel){
            // for pic_1
            if(req.files.businesslogo.size){
              var user_folder_path = path.resolve(__dirname + "../../../public/uploads/photos/"+req.user.id);
              if(fs.existsSync(user_folder_path)){
                if(!fs.existsSync(user_folder_path+"/"+node.id)){
                  fs.mkdirSync(user_folder_path+"/"+node.id);
                }
              }
              else{
                fs.mkdirSync(user_folder_path);
                fs.mkdirSync(user_folder_path+"/"+node.id);
              }
              fs.readFile(req.files.businesslogo.path, function (err, data) {
                var imageName = req.files.businesslogo.name
                var extention = imageName.substr(imageName.lastIndexOf('.'));
                var pic = "Ad_"+node.id+"_logo"+extention;
                fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
                    Photos.create({imagename:pic}, node, function(err, img){
                    if(err){console.log("Image Could Not Be Saved");}            
                  });
                });  
              }); 
              if(req.body.status==1){      
                res.redirect('createbusinessad');
              }
              else{      
                res.redirect('previewbusinessad?id='+node.id);
              }   
            } 
          });
        });
      });
    }
    else{
      Ads.create(req.body, req.user.id, function (err, node) {
        if (err) console.log(err);
        Ads.relateToCategory(node, category[0], function(err, rel){
          // for pic_1
          if(req.files.businesslogo.size){
            var user_folder_path = path.resolve(__dirname + "../../../public/uploads/photos/"+req.user.id);
            if(fs.existsSync(user_folder_path)){
              if(!fs.existsSync(user_folder_path+"/"+node.id)){
                fs.mkdirSync(user_folder_path+"/"+node.id);
              }
            }
            else{
              fs.mkdirSync(user_folder_path);
              fs.mkdirSync(user_folder_path+"/"+node.id);
            }
            fs.readFile(req.files.businesslogo.path, function (err, data) {
              var imageName = req.files.businesslogo.name
              var extention = imageName.substr(imageName.lastIndexOf('.'));
              var pic = "Ad_"+node.id+"_logo"+extention;
              fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
                  Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}            
                });
              });  
            }); 
          } 
          if(req.body.status==1){      
            res.redirect('createbusinessad');
          }
          else{      
            res.redirect('previewbusinessad?id='+node.id);
          }  
        })          
      });
    }
  });
}

postadsController.previewbusinessad= function() {
  var req = this.req;
  var th = this;
  var nodeId = this.req.param('id');
  Ads.findByID(nodeId, function(err, ad){
    if(err){console.log(err)}
      Ads.getAdImages(nodeId, function(err, images){
        if(err){console.log(err);} 
        Ads.getCategory(nodeId, function(err, category){
          ad._node[0].category = category[0].categoryname;
          th.render({aduser:req.user, user:req.user, ad:ad._node[0], images:images, pages : pages_});
        });              
      });  
  });
}

postadsController.viewbusinessad= function() {
  var req = this.req;
  var th = this;
  var adid = this.req.param('id');
  var arr = [];
  var userid = 0;
  if(req.user)
  {
    userid = req.user.id;
  }
  Ads.getAllInformation(adid, function(err, ad){    
    if(err){console.log(err)}      
      var _ad = ad[0].ad;
      var user = ad[0].u;
      var users = [];
      _ad.isWatched = 0;
      Ads.getAdImages(adid, function(err, images){
        if(err){console.log(err);}   
        Ads.getAllRecommendations(adid,  userid, function(err, recommendations){
          console.log("\n\n\n\n");
          console.log(recommendations);
          console.log("\n\n\n\n");
          User.getAllByType('user', function(err, users){
            Review.getAllReviews(adid, function(err, reviews){
              Ads.getAllReplies(adid,function(err, replies){
                Ads.getCategory(adid, function(err, category){
                  _ad.category = category[0].categoryname;
                    Ads.getAllAds(function(err,ads){
                     Category.getAllCategories(function(err, categories){ 
                  th.render({visitor : req.user, aduser:user, user:req.user, ad:_ad, images:images, reviews:reviews, users : users, recommendations : recommendations, replies : replies, pages : pages_,data:ads, categories: categories});
                });                
              });
                });                
              });
            });                
          });          
        });
      });  
  });  
}


postadsController.publishbusinessad= function() {
  var req = this.req;
  var th = this;
  var nodeId = this.req.param('id') ;
  Ads.publishUseAd(nodeId, function(err, ad){
    if(err){console.log(err)}
    th.res.redirect('createbusinessad');
  });   
}

postadsController.editbusinessad= function() {
  var req = this.req;
  var res = this.res;
  var th = this;
  var nodeId = this.req.param('id');
  var ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  if(ip && ip.trim()=="127.0.0.1"){
    ip = "117.218.182.86";
  }
  var userdata = new Object();
  if(req.user)
  {
    userdata.user = req.user;
    userdata.followings = req.user.followings;
    userdata.followers = req.user.followers;
    userdata.adsCount = req.user.adsCount;
    userdata.ads = req.user.ads;
    
    Ads.findByID(nodeId, function(err, ad){
      if(err){
        console.log(err)
      }    
      Ads.getAdImages(nodeId, function(err, images){
          if(err){console.log(err);} 
          Ads.getCategory(nodeId, function(err, category){
            ad._node[0].category = category[0].categoryname;
               Ads.getAllAds(function(err,ads){
               Category.getAllCategories(function(err, categories){ 
            th.render({user:req.user, data: userdata, ad:ad._node[0], images:images, ip : ip, mapkey:mapkey, pages : pages_,data:ads,categories:categories});
          });           
            });
          });           
      });
    });
  } 
  else
  {
    this.res.redirect('/');
  }   
}

postadsController.saveeditbusinessad= function() {
  var req = this.req;
  var res = this.res;
  
  var image = req.body.pic_1_src;

  var adid = req.body.adid;

  delete req.body.pic_1_src;
  delete req.body.adid;

  console.log(req.body, "ADID = "+adid);

  Ads.findByID(adid, function(err, ad){
    if (err) console.log(err);
    ad._node[0].phone = req.body.phone;    
    ad._node[0].keywords = req.body.keywords;    
    ad._node[0].monday = req.body.monday;    
    ad._node[0].category = req.body.category;    
    ad._node[0].slogan = req.body.slogan;    
    ad._node[0].startdate = req.body.startdate;    
    ad._node[0].email = req.body.email;    
    ad._node[0].contactname = req.body.contactname;    
    ad._node[0].address = req.body.address;    
    ad._node[0].description = req.body.description;    
    ad._node[0].adtitle = req.body.adtitle;    
    ad._node[0].longitude = req.body.longitude;    
    ad._node[0].latitude = req.body.latitude;    
    ad._node[0].enddate = req.body.enddate;    
    ad._node[0].monday = req.body.monday;    
    ad._node[0].mondayam = req.body.mondayam;    
    ad._node[0].mondaypm = req.body.mondaypm;    
    ad._node[0].tuesday = req.body.tuesday;    
    ad._node[0].tuesdayam = req.body.tuesdayam;    
    ad._node[0].tuesdaypm = req.body.tuesdaypm;    
    ad._node[0].wednesday = req.body.wednesday;    
    ad._node[0].wednesdayam = req.body.wednesdayam;    
    ad._node[0].wednesdaypm = req.body.wednesdaypm;    
    ad._node[0].thursday = req.body.thursday;    
    ad._node[0].thursdayam = req.body.thursdayam;    
    ad._node[0].thursdaypm = req.body.thursdaypm;    
    ad._node[0].friday = req.body.friday;        ;    
    ad._node[0].fridayam = req.body.fridayam;
    ad._node[0].fridaypm = req.body.fridaypm;
    ad._node[0].saturday = req.body.saturday;    
    ad._node[0].saturdayam = req.body.saturdayam;    
    ad._node[0].saturdaypm = req.body.saturdaypm    
    ad._node[0].sunday = req.body.sunday;    
    ad._node[0].sundayam = req.body.sundayam;    
    ad._node[0].sundaypm = req.body.sundaypm;    
    ad._node[0].accrediation = req.body.accrediation;
    ad._node[0].abn = req.body.abn;
    ad._node[0].areaofexpertise = req.body.areaofexpertise;

    Ads.update(ad, function (err, _ad) {
    if (err) console.log(err);
    var node = _ad[0];
    var user_folder_path = path.resolve(__dirname + "../../../public/uploads/photos/"+req.user.id);
    if(fs.existsSync(user_folder_path)){
      if(!fs.existsSync(user_folder_path+"/"+node.id)){
        fs.mkdirSync(user_folder_path+"/"+node.id);
      }
    }
    else{
      fs.mkdirSync(user_folder_path);
      fs.mkdirSync(user_folder_path+"/"+node.id);
    }
     if(image!=""){
        fs.readFile(req.files.pic_1.path, function (err, data) {
          var imageName = req.files.pic_1.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_logo"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
        });  
      }); 
    }
      res.redirect("editbusinessad?id=" + adid);
    });    
  });
}

// Controllers Related To UserAd

postadsController.createuserad = function() {
  var req = this.req;
  var res = this.res;
  var th = this;
  var ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  if(ip && ip.trim()=="127.0.0.1"){
    ip = "117.218.182.86";
  }
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
  if(req.user)
  {
    userdata.user = req.user;
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
            Category.getAllCategories(function(err, categories){
              th.render({ user:req.user, data : userdata, ip:ip, mapkey : mapkey, categories : categories, pages : pages_});  
            });            
          }
        }  
        next();
      });  
    });
  }
  else
  {
    this.res.redirect('/');
  }
}

postadsController.saveuserad = function() {
  var req = this.req;
  var res = this.res;
  var fullDate = new Date();//Thu May 19 2011 17:25:38 GMT+1000 {}
  var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1);
  var currentDate = fullDate.getFullYear() + "/" + twoDigitMonth + "/" + fullDate.getDate();
  req.body.createddate = currentDate; 

  Ads.create(req.body, req.user.id, function (err, node) {
    if (err) console.log(err);
    
    var user_folder_path = path.resolve(__dirname + "../../../public/uploads/photos/"+req.user.id);
    if(fs.existsSync(user_folder_path)){
      if(!fs.existsSync(user_folder_path+"/"+node.id)){
        fs.mkdirSync(user_folder_path+"/"+node.id);
      }
    }
    else{
      fs.mkdirSync(user_folder_path);
      fs.mkdirSync(user_folder_path+"/"+node.id);
    }

    // for pic_1
    if(req.files.pic_1.size){
      fs.readFile(req.files.pic_1.path, function (err, data) {
        var imageName = req.files.pic_1.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_1"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        });  
      }); 
    }
    // for pic_2
    if(req.files.pic_2.size){
      fs.readFile(req.files.pic_2.path, function (err, data) {
        var imageName = req.files.pic_2.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_2"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        });   
      }); 
    }
    // for pic_3
    if(req.files.pic_3.size){
      fs.readFile(req.files.pic_3.path, function (err, data) {
        var imageName = req.files.pic_3.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_3"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        });  
      }); 
    }
    // for pic_4
    if(req.files.pic_4.size){
      fs.readFile(req.files.pic_4.path, function (err, data) {
        var imageName = req.files.pic_4.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_4"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        });    
      }); 
    }
    // for pic_5
    if(req.files.pic_5.size){
      fs.readFile(req.files.pic_5.path, function (err, data) {
        var imageName = req.files.pic_5.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_5"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        }); 
      }); 
    }
    // for pic_6
    if(req.files.pic_6.size){
      fs.readFile(req.files.pic_6.path, function (err, data) {
        var imageName = req.files.pic_6.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_6"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        }); 
      }); 
    }
    // for pic_7
    if(req.files.pic_7.size){
      fs.readFile(req.files.pic_7.path, function (err, data) {
        var imageName = req.files.pic_7.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_7"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        }); 
      }); 
    }
    // for pic_8
    if(req.files.pic_8.size){
      fs.readFile(req.files.pic_8.path, function (err, data) {
        var imageName = req.files.pic_8.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_8"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        }); 
      }); 
    }
    // for pic_9
    if(req.files.pic_9.size){
      fs.readFile(req.files.pic_9.path, function (err, data) {
        var imageName = req.files.pic_9.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_9"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        }); 
      }); 
    }
    // for pic_10
    if(req.files.pic_10.size){
      fs.readFile(req.files.pic_10.path, function (err, data) {
        var imageName = req.files.pic_10.name
        var extention = imageName.substr(imageName.lastIndexOf('.'));
        var pic = "Ad_"+node.id+"_10"+extention;
        fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.create({imagename:pic}, node, function(err, img){
            if(err){console.log("Image Could Not Be Saved");}
          });
        });     
      }); 
    }
    if(req.body.status == 1){      
      res.redirect('createuserad');
    }
    else{      
      res.redirect('previewuserad?id='+node.id);
    }
  });    
}

postadsController.previewuserad= function() {
  var req = this.req;
  var th = this;
  var nodeId = this.req.param('id');
  Ads.findByID(nodeId, function(err, ad){
    if(err){console.log(err)}
      Ads.getAdImages(nodeId, function(err, images){
        if(err){console.log(err);}        
        th.render({aduser:req.user, user:req.user, ad:ad._node[0], images:images, pages : pages_});
      });  
  });  
}

postadsController.viewuserad= function() {
  var req = this.req;
  var th = this;
  var adid = this.req.param('id');
  var arr = [];
  var userid = 0;
  if(req.user)
  {
    userid = req.user.id;
  }
  Ads.getAllInformation(adid, function(err, ad){    
    if(err){console.log(err)}
      var _ad = ad[0].ad;    
      _ad.isWatched = 0;
      var user = ad[0].u;
      Ads.getAdImages(adid, function(err, images){
        if(err){console.log(err);}
        User.isAdWatched(userid, _ad.id, function(err, ad){
          if(ad && ad.length > 0)
          {
            _ad.isWatched = 1;
          }
          Ads.getAllReplies(adid,function(err, replies){
            console.log("\n\n\n\nReplies = ", replies, "\n\n\n\n");
            th.render({visitor : req.user, aduser:user, user:req.user, ad:_ad, images:images, replies : replies, pages : pages_});
          });
        });        
      });  
  });  
}

postadsController.publishuserad= function() {
  var req = this.req;
  var th = this;
  var nodeId = this.req.param('id') ;
  Ads.publishUseAd(nodeId, function(err, ad){
    if(err){console.log(err)}
    th.res.redirect('createuserad');
  });   
}

postadsController.edituserad= function() {
  var req = this.req;
  var res = this.res;
  var th = this;
  var nodeId = this.req.param('id');
  var ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  if(ip && ip.trim()=="127.0.0.1"){
    ip = "117.218.182.86";
  }
  var userdata = new Object(); 
  var arr = [];
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
  if(req.user)
  {
    userdata.user = req.user;
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
              Ads.findByID(nodeId, function(err, ad){
                if(err){
                  console.log(err)
                }    
                Ads.getAdImages(nodeId, function(err, images){
                  if(err){console.log(err);}
                  Category.getAllCategories(function(err, categories){
                    th.render({user:req.user, data: userdata, ad:ad._node[0], images:images, ip : ip, mapkey:mapkey, pages : pages_, categories : categories });
                  });                    
                });
              });                
            }
        }  
        next();
      });  
    });       
  } 
  else
  {
    this.res.redirect('/');
  }   
}

postadsController.saveedituserad= function() {
  var req = this.req;
  var res = this.res;
  var imagesObj = new Object();
  imagesObj.image1 = req.body.pic_1_src;
  imagesObj.image2 = req.body.pic_2_src;
  imagesObj.image3 = req.body.pic_3_src;
  imagesObj.image4 = req.body.pic_4_src;
  imagesObj.image5 = req.body.pic_5_src;
  imagesObj.image6 = req.body.pic_6_src;
  imagesObj.image7 = req.body.pic_7_src;
  imagesObj.image8 = req.body.pic_8_src;
  imagesObj.image9 = req.body.pic_9_src;
  imagesObj.image10 = req.body.pic_10_src;
  var adid = req.body.adid;
  delete req.body.pic_1_src;
  delete req.body.pic_2_src;
  delete req.body.pic_3_src;
  delete req.body.pic_4_src;
  delete req.body.pic_5_src;
  delete req.body.pic_6_src;
  delete req.body.pic_7_src;
  delete req.body.pic_8_src;
  delete req.body.pic_9_src;
  delete req.body.pic_10_src;
  delete req.body.adid;

  Ads.findByID(adid, function(err, ad){
    if (err) console.log(err);

    ad._node[0].phone = req.body.phone;    
    ad._node[0].keywords = req.body.keywords;    
    //ad._node[0].createdate = req.body.createdate;    
    ad._node[0].advertised = req.body.advertised;    
    ad._node[0].category = req.body.category;    
    ad._node[0].jobtype = req.body.jobtype;    
    ad._node[0].startdate = req.body.startdate;    
    ad._node[0].email = req.body.email;    
    ad._node[0].contactname = req.body.contactname;    
    ad._node[0].address = req.body.address;    
    ad._node[0].description = req.body.description;    
    ad._node[0].adtitle = req.body.adtitle;    
    ad._node[0].longitude = req.body.longitude;    
    ad._node[0].latitude = req.body.latitude;    
    ad._node[0].enddate = req.body.enddate;    

    Ads.update(ad, function (err, _ad) {
    if (err) console.log(err);
    var node = _ad[0];
    var user_folder_path = path.resolve(__dirname + "../../../public/uploads/photos/"+req.user.id);
    if(fs.existsSync(user_folder_path)){
      if(!fs.existsSync(user_folder_path+"/"+node.id)){
        fs.mkdirSync(user_folder_path+"/"+node.id);
      }
    }
    else{
      fs.mkdirSync(user_folder_path);
      fs.mkdirSync(user_folder_path+"/"+node.id);
    }
     if(imagesObj.image1!=""){
        fs.readFile(req.files.pic_1.path, function (err, data) {
          var imageName = req.files.pic_1.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_1"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          });  
        }); 
      }
      // for pic_2
      if(imagesObj.image2!=""){
        fs.readFile(req.files.pic_2.path, function (err, data) {
          var imageName = req.files.pic_2.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_2"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          });   
        }); 
      }
      // for pic_3
      if(imagesObj.image3!=""){
        fs.readFile(req.files.pic_3.path, function (err, data) {
          var imageName = req.files.pic_3.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_3"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          });  
        }); 
      }
      // for pic_4
      if(imagesObj.image4!=""){
        fs.readFile(req.files.pic_4.path, function (err, data) {
          var imageName = req.files.pic_4.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_4"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          });    
        }); 
      }
      // for pic_5
      if(imagesObj.image5!=""){
        fs.readFile(req.files.pic_5.path, function (err, data) {
          var imageName = req.files.pic_5.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_5"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          }); 
        }); 
      }
      // for pic_6
      if(imagesObj.image6!=""){
        fs.readFile(req.files.pic_6.path, function (err, data) {
          var imageName = req.files.pic_6.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_6"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          });
        }); 
      }
      // for pic_7
      if(imagesObj.image7!=""){
        fs.readFile(req.files.pic_7.path, function (err, data) {
          var imageName = req.files.pic_7.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_7"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          }); 
        }); 
      }
      // for pic_8
      if(imagesObj.image8!=""){
        fs.readFile(req.files.pic_8.path, function (err, data) {
          var imageName = req.files.pic_8.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_8"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          }); 
        }); 
      }
      // for pic_9
      if(imagesObj.image9!=""){
        fs.readFile(req.files.pic_9.path, function (err, data) {
          var imageName = req.files.pic_9.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_9"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          }); 
        }); 
      }
      // for pic_10
      if(imagesObj.image10!=""){
        fs.readFile(req.files.pic_10.path, function (err, data) {
          var imageName = req.files.pic_10.name
          var extention = imageName.substr(imageName.lastIndexOf('.'));
          var pic = "Ad_"+node.id+"_10"+extention;
          fs.writeFile(user_folder_path+"/"+node.id+"/"+pic, data, function (err) {
            Photos.findByImageName(pic, function(err, img){
              if(img.length==0){
                Photos.create({imagename:pic}, node, function(err, img){
                  if(err){console.log("Image Could Not Be Saved");}
                  else{console.log("<<<<<<<<<<<<<<<<<<<<<<--------Image Saved SuccessFully", img);}
                });
              }
            });
          });     
        }); 
      }
      res.redirect("edituserad?id=" + adid);
    });    
  });   
}

postadsController.uploadfiletotemp = function() {
  var req = this.req;
  var res = this.res;
  fs.readFile(req.files.upload_pic.path, function (err, data) {
    var imageName = req.files.upload_pic.name
    /// If there's an error
    if(!imageName){
      res.redirect("back");
      res.end();
    } else {      
      var newPath =path.resolve(__dirname + "../../../public/uploads/" + imageName);
      fs.writeFile(newPath, data, function (err) {
        res.end("uploads/" + imageName);
      });
    }
  });
}

postadsController.searchAds = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var keywords = (req.param('keywords') == undefined ? "" : req.param('keywords'));
  var category = (req.param('category') == undefined ? "" : req.param('category'));
  var location = (req.param('location') == undefined ? "" : req.param('location'));
  var distance = (req.param('distance') == undefined ? "" : req.param('distance'));
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
          th.render('people', {users: users, user:req.user, relationships:relationships, mostfollowers : topfollowers, search: search, pages : pages_,data:ads,categories:categories});
        }); 
      });      
    });
  });
  
  });
}

postadsController.showSearchResults = function() {
  var th = this;
  var req = this.req;
  var res = this.res;
  var params = new Object();
  var keywords = (req.param('keyword') == undefined ? "" : req.param('keyword'));
  var category = (req.param('category') == undefined ? "" : req.param('category'));
  var location = (req.param('location') == undefined ? "" : req.param('location'));
  var distance = (req.param('distance') == undefined ? "" : req.param('distance'));
  params.keywords = keywords;
  params.category = category;
  params.location = location;
  params.distance = distance;
  Ads.searchAds(keywords,category, location, distance, function(err, result){
    var i =-1;
      var next = function() {
          i++;   
          if (i < result.length) { 
            result[i].imageurl = "images/no-image.jpg"; 
            Ads.getOneAdImage(result[i].adid,function(err,img){               
              if(img.length > 0)
              {             
              result[i].imageurl = "/uploads/photos/"+result[i].userid+"/"+result[i].adid+"/"+img[0].photo;
              }
              next();                
            });             
          }
          else
          {       
            Ads.getAllAds(function(err,ads){ 
             Category.getAllCategories(function(err, categories){ 
            th.render('search', {user:req.user,ads:result, pages : pages_,data:ads,categories:categories});
           }); 
        }); 
          }
      }  
      next();
  });  
}

postadsController.recommendad = function(){
    var th = this;
    var req = this.req;
    var res = this.res;
    var id = th.req.param('id');
    Ads.markasrecommended(id, req.user.id, function(err){
      if (err) 
      {
          res.send({success : false});
      }
      else
      { 
          res.send({success : true});
      }
    });
  }

  postadsController.unrecommendad = function(){
    var th = this;
    var req = this.req;
    var res = this.res;
    var id = th.req.param('id');
    Ads.markasunrecommended(id, req.user.id, function(err){
      if (err) 
      {
          res.send({success : false});
      }
      else
      {
          res.send({success : true});
      }
    });
  }


  postadsController.recommendadtouser = function(){
    var th = this;
    var req = this.req;
    var res = this.res;
    var adid = th.req.param('adid');
    var targetuser = th.req.param('targetuser');
   
    Ads.recommendadtouser(adid, req.user.id,  targetuser,  function(err, rel){
      res.end('success');
    });    
  }
postadsController.writereview = function(){
  var req = this.req;
  var res = this.res;
  var id = req.param('id');
    this.render({adid:id,user:req.user, pages : pages_});
}

postadsController.savereview = function(){
  var req = this.req;
  var res = this.res;
  var id = req.param('id');
  req.body.userid = req.user.id;
  Review.create(req.body,id, function(err, review){
    if(err){console.log("Error")}
    res.redirect("viewbusinessad?id="+id);
  });
}

postadsController.adreply = function(){
  var req = this.req;
  var res = this.res;
  var adid = req.param('adid');
  Ads.saveReply(adid, req.user.id,  req.body.description,  function(err, reply){
     if(err){console.log("Error", req.body.description)}
    res.redirect('back'); 
  });   
} 

postadsController.blockad = function(){
 var req = this.req;
  var th = this;
  var nodeId = this.req.param('id') ;
  Ads.blockUseAd(nodeId, function(err, ad){
    if(err){console.log(err)}
    th.res.redirect('createuserad');
  });   
}



module.exports = postadsController;