var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , Ads = require('../models/ads')
  , Category = require('../models/category')
  , Pages = require('../models/pages')
  ,pages_;

var pagesController = new Controller();

pagesController.before('*', function(next){
  Pages.getAll(function(err, data){
    console.log("\n\n\n\npages=",data);
    pages_ = data;
    next();
  });
  });
pagesController.home = function() {
	var req = this.req;
	var th = this;
	Ads.getFeaturedAds(function(err, result){
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
            Ads.getAllAds(function(err,ads)
          { 
            Category.getAllCategories(function(err, categories){
             th.render({user:req.user,ads:result,pages : pages_,data:ads,categories:categories}); 
            });
           });
          }
      }  
      next();    
	});
}
pagesController.navpage = function() {
  var req = this.req;
  var th = this;
  var pg = req.param('pg');
  Pages.getPageByName(pg, function(err, node){
     Category.getAllCategories(function(err, categories){
    th.render("page", {user:req.user, data : node,pages : pages_, categories: categories}); 
  }); 
  }); 
}

pagesController.register = function() {
  var req = this.req;
  var th = this;
  var pg = req.param('pg');
  var noemail = (req.param('noemail') != undefined ? req.param('noemail') : "false");
  var message = "";
  var user = req.user;
  var data = new Object();
  data.name = "";
  data.email = "";
  if(noemail == "true")
  {   
    message = "You are not signed up becuase we did not get your email from the service provider you choose. Please create a tradie account by filling the below information.";
    user = null;
  }
  th.render({user:user, message : message, data : data,pages : pages_});
}

pagesController.signin = function() {
  var req = this.req;
  var th = this;
  var pg = req.param('pg');
  var failure = (req.param('failure') != undefined ? req.param('failure') : "false");
  var message = "";
  if(failure == "true")
  {   
    message = "Invalid Email or Password.";
    user = null;
  }
   Ads.getAllAds(function(err,ads)
   { 
    Category.getAllCategories(function(err, categories){ 
     th.render({user:req.user, message : message,pages : pages_, data:ads,categories:categories});
   });  
   });  
}

module.exports = pagesController;
