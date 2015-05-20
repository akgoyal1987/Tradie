var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , assets = require("../../config/assets")
  , db = require("seraph")(assets.db_url)
  , User = require('../models/user')
  , Ads = require('../models/ads')
  , Pages = require('../models/pages')
  , Usertypes = require('../models/usertypes')
  , fs    = require("fs")
  , path = require('path')
  ,nodemailer = require("nodemailer")
  , passport = require('passport')
  ,pages_;

  var AdminController = new Controller();
  AdminController.before('*', function(next){
  	var th = this;
  	var user = this.req.user;
      if(user){
        if(user.usertype=="admin" || user.usertype=="superadmin" ){
           Pages.getAll(function(err, data){
            pages_ = data;
          next();
        });
        }else{
          this.render('login', {user:null});
  			}
      } else{
        this.render('login', {user:null});
  		}
	});

  AdminController.index = function(){
    var th = this;
	  User.getAllByType('user', function(err, users){
      th.render('home', {user:th.req.user, users:users,pages : pages_});
    });  	
  };

  AdminController.tradesman = function(){
    var th = this;
    User.getAllByType('tradesman', function(err, users){
      th.render('home', {user:th.req.user, users:users,pages : pages_});
    });
  }	

  AdminController.markfeatured = function(){
    var th = this;
    var req = this.req;
    var res = this.res;
    var id = th.req.param('id');
    Ads.markasfeatured(id, function(err){
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

  AdminController.markunfeatured = function(){
    var th = this;
    var req = this.req;
    var res = this.res;
    var id = th.req.param('id');
    Ads.markasunfeatured(id, function(err){
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

  AdminController.viewads = function(){
    var th = this;
    var req = this.req;
    var res = this.res;
    var id = (th.req.param('id') == undefined ? "" : th.req.param('id'));
    User.getUserAds(id, function(err, ads){
      var i =-1;
      var next = function() {
          i++;   
          if (i < ads.length) {  
            Ads.getAdPhotos(ads[i].adid, false, function(err,ad){ 
              ads[i].ad = ad;              
              ads[i].ad.isRecommended = 0;   
              Ads.isRecommended(ads[i].adid, req.user.id, function(err,recad){ 
                if(recad.length > 0)
                {
                  ads[i].ad.isRecommended = 1;  
                } 
              next();    
            });             
            });             
          }
          else
          {     
            console.log("ads",ads);       
            th.render({ads:ads,pages : pages_});          
          }
      }  
      next();
    });    
  }
      
  AdminController.featuredads = function(){
    var req = this.req;
    var th = this;
    Ads.getFeaturedAds(function(err, result){
    var i =-1;
      var next = function() {
          i++;   
          if (i < result.length) {            
            Ads.getOneAdImage(result[i].adid,function(err,img){               
              if(img.length > 0)
              {             
                result[i].photo = img[0].photo;
              }
              next();                
            });             
          }
          else
          {        
            console.log("result", result);
            th.render({user:req.user,ads:result,pages : pages_}); 
          }
      }  
      next();
    });
  }

  AdminController.getpages = function(){
    var req = this.req;
    var th = this;
    Pages.getAll(function(err, result){
      console.log("result", result);
      th.render("pages",{user:req.user, pages:result,pages : pages_});
    });    
  }

  AdminController.page = function(){
    var req = this.req;
    var th = this;
    var id = (req.param('id') != undefined ? req.param('id') : "");

    if(id != "")
    {
      Pages.getPageByID(id, function(err, node){
        console.log("node", node);
        th.render("page",{user:req.user, data:node,pages : pages_});
      }); 
    }
    else
    {
       th.render("page",{user:req.user, data:null,pages : pages_});
    }
  }

  AdminController.createpage = function(){
    var req = this.req;
    var res = this.res;
    var th = this;
    var id = req.body.id;

    if(id != "0")
    {
      console.log("id",id);
      Pages.getPageByID(id, function(err, node){
        node[0].displayname = req.body.displayname;
        node[0].content = req.body.content;
        node[0].name = req.body.displayname.replace(/ /g,'').toLowerCase();        
        Pages.update(node, function (err, _pg) {
          if(!err)
          {
            res.redirect("/admin/page?id=" + id);
          }
        });
        
      }); 
    }
    else
    {
      delete req.body.id;
      req.body.name = req.body.displayname.replace(/ /g,'').toLowerCase(); 
      Pages.create(req.body, function (err, node) {
        if(!err)
        {
          res.redirect("/admin/pages");
        }
      });
    }
  }

AdminController.showspamads = function(){
    var req = this.req;
    var th = this;
    Ads.findSpamAds(function(err, result){
    var i =-1;
      var next = function() {
          i++;   
          if (i < result.length) {            
            Ads.getOneAdImage(result[i].adid,function(err,img){               
              if(img.length > 0)
              {             
                result[i].photo = img[0].photo;
              }
              next();                
            });             
          }
          else
          {        
            console.log("result", result);
            th.render({user:req.user,ads:result,pages : pages_}); 
          }
      }  
      next();
    });
  }


AdminController.deletead = function(){
    var th = this;
    var req = this.req;
    var res = this.res;
    var id = th.req.param('id');
    Ads.getUser(id, function(err, user){
      var user_folder_path = path.resolve(__dirname + "../../../public/uploads/photos/"+user[0].id+"/"+id);
      console.log("Path = \n\n", user_folder_path);
      rmDir(user_folder_path);
      Ads.deleteAdWithImages(id, function(err, result){
        console.log("Result = \n\n" , result);
        res.redirect('back');
      });
    });    
  }     

  AdminController.deletedir = function(){
    var th = this;
    var req = this.req;
    var res = this.res;
    var id = th.req.param('id');
    var  user_folder_path = path.resolve(__dirname + "../../../public/uploads/photos/5699/5706");    
    rmDir(user_folder_path);
    res.end('-- End --');

  }

var rmDir = function(dirPath) {     
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { 
      return; 
    }
    if (files.length > 0)
      for (var i = 0; i < files.length; i++) {
        var filePath = dirPath + '/' + files[i];
        if (fs.statSync(filePath).isFile())
          fs.unlinkSync(filePath);
        else
          rmDir(filePath);
      }
    fs.rmdirSync(dirPath);
  };
     
AdminController.categories = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  var categories = [];
  var SuperCategories = [];
  qry = "MATCH (c:Category) RETURN c";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      if (typeof(node) === 'object' && node.length == undefined){  
          categories.push(node);
      }
      else{categories = node}
      qry = "MATCH (c:SuperCategory) RETURN c";
      db.query(qry, function (err, node) {
        if (err) return callback(err);
        if (typeof(node) === 'object' && node.length == undefined){  
            SuperCategories.push(node);
        } 
        else{SuperCategories = node}
        th.render({user:req.user, supercategories:SuperCategories,categories:categories, formAction : "addcategory", type : "Category",pages : pages_, errmsg : ""});
    });
  });
} 

AdminController.advertisedby = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  qry = "MATCH (n:AdvertisedBy) RETURN n";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      else th.render("show_dropdown_items",{user:req.user, items:node, formAction : "addadvertisedby",  type : "Advertised By",pages : pages_, errmsg : ""});
  });
} 

AdminController.jobtypes = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  qry = "MATCH (n:JobType) RETURN n";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      else th.render("show_dropdown_items",{user:req.user, items:node, formAction : "addjobtypes",  type : "Job Type",pages : pages_, errmsg : ""});
  });
} 

AdminController.locations = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  qry = "MATCH (n:Location) RETURN n";
  db.query(qry, function (err, node) {
      if (err) return callback(err);
      else th.render("show_dropdown_items",{user:req.user, items:node, formAction : "addLocation",  type : "Location",pages : pages_,errmsg : ""});
  });
} 

AdminController.addcategory = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  qry = "MATCH (n) where n.name=\'"+req.body.name.trim()+"\' RETURN n";
  db.query(qry, function (err, node) {
      if (err) {res.end(JSON.stringify(err));}
      else if(node.length>0){
        qry = "MATCH (n:Category) RETURN n";
        db.query(qry, function (err, node) {
          th.render("show_dropdown_items",{user:req.user, items:node, formAction : "addcategory", type : "Category",pages : pages_, errmsg : "Category already exist."});
        });
      }else{
        db.save(req.body, function(err, node) {
          if (err) {res.end(JSON.stringify(err));}
          else{
            db.label(node,'SuperCategory', function(err,ads) {
              if (err) {res.end(JSON.stringify(err));}
              else{
                res.redirect("back");
              }        
            });
          }
        });
      }
  });
} 

AdminController.addadvertisedby = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  qry = "MATCH (n) where n.name=\'"+req.body.name.trim()+"\' RETURN n";
  db.query(qry, function (err, node) {
      if (err) {res.end(JSON.stringify(err));}
      else if(node.length>0){
        qry = "MATCH (n:AdvertisedBy) RETURN n";
        db.query(qry, function (err, node) {
          th.render("show_dropdown_items",{user:req.user, items:node, formAction : "addcategory", type : "Advertised By",pages : pages_, errmsg : "Advertised By already exist."});
        });
      }else{
        db.save(req.body, function(err, node) {
          if (err) {res.end(JSON.stringify(err));}
          else{
            db.label(node,'AdvertisedBy', function(err,ads) {
              if (err) {res.end(JSON.stringify(err));}
              else{
                res.redirect("back");
              }        
            });
          }
        });
      }
  });
} 

AdminController.addjobtypes = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  qry = "MATCH (n) where n.name=\'"+req.body.name.trim()+"\' RETURN n";
  db.query(qry, function (err, node) {
      if (err) {res.end(JSON.stringify(err));}
      else if(node.length>0){
        qry = "MATCH (n:JobType) RETURN n";
        db.query(qry, function (err, node) {
          th.render("show_dropdown_items",{user:req.user, items:node, formAction : "addcategory", type : "Job Type",pages : pages_, errmsg : "Job Type already exist."});
        });
      }else{
        db.save(req.body, function(err, node) {
          if (err) {res.end(JSON.stringify(err));}
          else{
            db.label(node,'JobType', function(err,ads) {
              if (err) {res.end(JSON.stringify(err));}
              else{
                res.redirect("back");
              }        
            });
          }
        });
      }
  });
}

AdminController.addLocation = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  qry = "MATCH (n) where n.name=\'"+req.body.name.trim()+"\' RETURN n";
  db.query(qry, function (err, node) {
      if (err) {res.end(JSON.stringify(err));}
      else if(node.length>0){
        qry = "MATCH (n:Location) RETURN n";
        db.query(qry, function (err, node) {
          th.render("show_dropdown_items",{user:req.user, items:node, formAction : "addcategory", type : "Location",pages : pages_, errmsg : "Location already exist."});
        });
      }else{
        db.save(req.body, function(err, node) {
          if (err) {res.end(JSON.stringify(err));}
          else{
            db.label(node,'Location', function(err,ads) {
              if (err) {res.end(JSON.stringify(err));}
              else{
                res.redirect("back");
              }        
            });
          }
        });
      }
  });
}

AdminController.deleteitem = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.param('id');
  db.delete(id, function(err){
    if (err) {res.end(JSON.stringify(err));}
    res.redirect('back');
  });
} 

AdminController.edititem = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.param('id');
  qry = "MATCH (n) where id(n)= "+id+" RETURN n";
  db.query(qry, function (err, node) {
      if (err) {res.end(JSON.stringify(err));}
      else{
        th.render("edit_dropdown_items", {item:node[0],pages : pages_});
      }
  });
}

AdminController.updateitem = function(){
  var th = this;
  var req = this.req;
  var res = this.res;
  var id = req.body.id;
  res.end(JSON.stringify(req.body));
  //this.render({user:req.user});
} 

AdminController.blockad = function(){
  var req = this.req;
  var res = this.res;
  var adid = req.param('adid');
 
  Ads.updateAds(adid,  function(err, reply){
    console.log("\n\n\n\nAd = ",reply );
    console.log("\n\n\n\nAd = ",reply[0].email );
    if(err){console.log("Error", adid)}
    var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
            user: "linkitestest@gmail.com",
            pass: "developer1"
      }
    });

    var mailOptions = {
      from: "Tradie", // sender address
      to: reply[0].email, // list of receivers
      subject: "Inform about Ads", // Subject line
      text:"your following ads are block reply[0].text",
     
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
        console.log("Error",error);        
      }else{
        console.log("Message sent: " + response.message);        
      }
      res.redirect('back');
    });   
  });
}


AdminController.unblockad = function(){
  var req = this.req;
  var res = this.res;
  var adid = req.param('adid');
 
  Ads.updateblockAds(adid,  function(err, reply){
    console.log("\n\n\n\nAd = ",reply );
    console.log("\n\n\n\nAd = ",reply[0].email );
    if(err){console.log("Error", adid)}
    var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
            user: "linkitestest@gmail.com",
            pass: "developer1"
      }
    });

    var mailOptions = {
      from: "Tradie", // sender address
      to: reply[0].email, // list of receivers
      subject: "Inform about Ads", // Subject line
      text:"your following ads are Unblock reply[0].text",
     
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
        console.log("Error",error);        
      }else{
        console.log("Message sent: " + response.message);        
      }
      res.redirect('back');
    });   
  });
}


AdminController.relateCategories = function(){
  var req = this.req;
  var res = this.res;
  var categories = req.body.category;
  var supercategory = req.body.SuperCategory;
  var i=-1;
  var next = function(){
    i++;
    if(i<categories.length){
      db.relate(categories[i],'belongs',supercategory, function (err, rel) {
        next();
      })
    }else{
      res.redirect('back');
    }
  }
  next();
}

  module.exports = AdminController;