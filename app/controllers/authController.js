var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , passport = require('passport')
  , Pages = require('../models/pages')
  , User = require('../models/user')
  , Usertypes = require('../models/usertypes')
  ,pages_;

var AuthController = new Controller();

AuthController.before('*', function(next){
  Pages.getAll(function(err, data){
    console.log("\n\n\n\npages=",data);
    pages_ = data;
    next();
  });
  });
//  Methods to be used for FaceBook Authentication
AuthController.facebook = function() {
    // does nothing, only a placeholder for the following hook.
}
AuthController.before('facebook', passport.authenticate('facebook'));
AuthController.facebookcallback = function() {
  // This will only be called when authentication succeeded. 
  var req = this.req;
  var th = this; 
  
  if(req.user.email != "")
  {
  User.find(req.user, function(err,usr){
    if(err)console.log(err);
    if(usr._node[0].usertype != undefined){
      th.redirect('/users');
    }
    else{
      th.redirect('/logintype');
    } 
 });  
}
  else{
    th.redirect('/signup?noemail=true');
  }
}
AuthController.before('facebookcallback', passport.authenticate('facebook',	{failureRedirect: '/'}));


//  Methods to be used for Twitter Authentication
AuthController.twitter = function() {
    // does nothing, only a placeholder for the following hook.
passport.authenticate('twitter');
}
AuthController.before('twitter', passport.authenticate('twitter'));
AuthController.callbackTwitter = function() {
  // This will only be called when authentication succeeded.
  var req = this.req;
  var th = this;  
  if(req.user.email != "")
  {
   User.find(req.user, function(err,usr){
        if(err)console.log(err);
    if(usr._node[0].usertype != undefined){
                  th.redirect('/users');  
    }
    else{
                  th.redirect('/logintype');
                } 
              });  
        }
  else
  {
    th.redirect('/signup?noemail=true');
  }
}
AuthController.before('callbackTwitter', passport.authenticate('twitter',	{failureRedirect: '/'}));


//  Methods to be used for Google Authentication
AuthController.google = function() {
    // does nothing, only a placeholder for the following hook.
}
AuthController.before('google', passport.authenticate('google'));
AuthController.returngoogle = function() {
  // This will only be called when authentication succeeded.
  var req = this.req;
  var th = this; 
  if(req.user.email != "")
  {
  User.find(req.user, function(err,usr){
    if(err)console.log(err);
    if(usr._node[0].usertype != undefined){
        th.redirect('/users');  
      }
      else{
        th.redirect('/logintype');
      } 
    });  
  }
  else
  {
    th.redirect('/signup?noemail=true');
  }  
}
AuthController.before('returngoogle', passport.authenticate('google',	{failureRedirect: '/'}));


//  Methods to be used for LinkedIn Authentication
AuthController.before('linkedin', passport.authenticate('linkedin',  { state: 'SOME STATE' }));
AuthController.linkedin = function(){};
AuthController.before('linkedincallback', passport.authenticate('linkedin', {failureRedirect: '/'}));
AuthController.linkedincallback = function() {  
  var req = this.req;
  var th = this; 
  if(req.user.email != "")
  { 
  User.find(req.user, function(err,usr){
    if(err)console.log(err);
    if(usr._node[0].usertype != undefined){
        th.redirect('/users');  
      }
      else{
        th.redirect('/logintype');
      } 
    });  
  }
  else
  {
    th.redirect('/signup?noemail=true');
  }   
};

AuthController.logout = function(){
	var req = this.req;
	var res = this.res;
  req.logout();
  res.redirect('/');
}
AuthController.adminlogout = function(){
  var req = this.req;
  var res = this.res;
  req.logout();
  res.redirect('/admin');
}


AuthController.before('adminlogin', passport.authenticate('local', { successRedirect: '/admin/users',
                                   failureRedirect: '/admin',
                                   failureFlash: true })
);
AuthController.adminlogin = function(){
}


AuthController.before('weblogin', passport.authenticate('local', { successRedirect: '/users',
                                   failureRedirect: '/signin?failure=true',
                                   failureFlash: true })
);
AuthController.weblogin = function(){
}

module.exports = AuthController;
