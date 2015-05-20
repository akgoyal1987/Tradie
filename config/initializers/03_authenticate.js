  var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , GoogleStrategy = require('passport-google').Strategy
  , LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
  , LocalStrategy = require('passport-local').Strategy
  , TWITTER_CONSUMER_KEY = 'Akxu6UYsnN5B7BsEF4MRxIl8G'
  , TWITTER_CONSUMER_SECRET = '975yenbLOCAY6RU3pwlQeS9cOCsymvZufxvqcEqIsOCSG5q6zF'
  , User = require('../../app/models/user') ;
  var AppUrl;
  var FACEBOOK_APP_ID;
  var FACEBOOK_APP_SECRET;
  var GOOGLE_URL;
  var GOOGLE_realm;
  var LinkedInCallbackUrl;
  var LINKEDIN_API_KEY = "75ipspwoek4vzk";
  var LINKEDIN_SECRET_KEY = "rwfiMtAcWGHPqC1f";
  if(__dirname.indexOf("vhosts")>=0){
  	FACEBOOK_APP_ID = '1473573422873066';
  	FACEBOOK_APP_SECRET = '8ddaccef525f95f7e5ed00ac984a7acd';
  	GOOGLE_URL = 'http://162.222.227.147:5000/auth/google/return';
  	GOOGLE_realm = 'http://162.222.227.147:5000/';
  	LinkedInCallbackUrl = "http://162.222.227.147:5000/auth/linkedin/callback";
  	AppUrl = "http://162.222.227.147:5000/"
  }else{
  	FACEBOOK_APP_ID = '438161219619474';
  	FACEBOOK_APP_SECRET = '968ce549a1fa551a88ebc2fb97ae9157';
  	GOOGLE_URL = 'http://localhost:5000/auth/google/return';
  	GOOGLE_realm = 'http://localhost:5000/';
  	LinkedInCallbackUrl = "http://localhost:5000/auth/linkedin/callback";  	
  	AppUrl = "http://localhost:5000/"
  }
 /*console.log("Directory Name = "+__dirname);
 console.log("FACEBOOK_APP_ID = "+FACEBOOK_APP_ID);
 console.log("FACEBOOK_APP_SECRET = "+FACEBOOK_APP_SECRET);
*/
module.exports = function() {
  passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos','location','email']

  },
  	function(accessToken, refreshToken, profile, done) {
	    // asynchronous verification, for effect...
	    process.nextTick(function () {
	      // To keep the example simple, the user's Facebook profile is returned to
	      // represent the logged-in user.  In a typical application, you would want
	      // to associate the Facebook account with a user record in your database,
	      // and return that user instead.
	      	console.log("profile>>>>>>>>>>>.",profile);
	      	var fullDate = new Date();//Thu May 19 2011 17:25:38 GMT+1000 {}
				  var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1);
				  var currentDate =  fullDate.getFullYear() + "/" + twoDigitMonth + "/" + fullDate.getDate();
	      	var object = new Object();
	      	object.createddate = currentDate;
	      	object.userid=profile.id;
	      	object.name=profile.displayName;
	     	if(profile.emails && profile.emails[0])
      		{
	     		object.email=profile.emails[0].value;
	 	 	}
	 	 	else
	 	 	{
	 	 		object.email="";
	 	 	}
	      	object.provider="facebook";
	      	if(profile.photos && profile.photos[0])
      		{
	     		object.photourl=profile.photos[0].value;
	 	 	}
	 	 	else
	 	 	{
	 	 		object.photourl= AppUrl + "images/no-pic.png";
	 	 	}	      	
	 	 	if(object.email != "")
	 	 	{
	      	User.find(object, function (err, usr) {
			  if (err) console.log(err);
			  if (usr._node[0]){
		      	  console.log("User<<<<<<<",usr._node[0]);
		      	  return done(null, usr._node[0]);       	
	      	  }else{
		      	  createUser(object, function(usr){
		      	  	return done(null, usr);  
		      	  });	      	
	      	  }     	
	  	  }); 
	  	    }
	  	    else
	  	    {
	  	    	return done(null, object);   
	  	    } 	
	    });
	  }
	));

	passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://162.222.227.147:5000/auth/twitter/callback"
	  },
	  function(token, tokenSecret, profile, done) {
	  	process.nextTick(function () {
	    		var fullDate = new Date();//Thu May 19 2011 17:25:38 GMT+1000 {}
				  //convert month to 2 digits
				  var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1);
				  var currentDate =  fullDate.getFullYear() + "/" + twoDigitMonth + "/" + fullDate.getDate();
	    		var object = new Object();
	      	object.createddate = currentDate;
	      	object.userid=profile.id;
	      	object.name=profile.username;
	     		if(profile.emails && profile.emails[0])
      			{
     				object.email=profile.emails[0].value;
		 	 	}
		 	 	else
		 	 	{
		 	 		object.email="";
		 	 	}
		      	object.provider="twitter";
		      	if(profile.photos && profile.photos[0])
	      		{
     				object.photourl=profile.photos[0].value;
		 	 	}
		 	 	else
		 	 	{
		 	 		object.photourl= AppUrl + "images/no-pic.png";
		 	 	}	      	
		 	 	if(object.email != "")
	 	 		{
		      	User.find(object, function (err, usr) {
					  if (err) console.log(err);
					  if (usr._node[0]){
				      	  console.log("User<<<<<<<",usr._node[0]);
				      	  return done(null, usr._node[0]);       	
			      	  }else{
				      	  createUser(object, function(usr){
				      	  	return done(null, usr);  
				      	  });	      	
			      	  }     	
			  	  }); 
				}
				else
				{
					return done(null, object);  
				} 
	   });  
	  }
	));

	passport.use(new GoogleStrategy({
		returnURL: GOOGLE_URL,
	    realm: GOOGLE_realm				
	  },
	  function(identifier, profile, done) {
	  	process.nextTick(function () {

		var fullDate = new Date();//Thu May 19 2011 17:25:38 GMT+1000 {}
	  //convert month to 2 digits
	  var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1);
	  var currentDate =  fullDate.getFullYear() + "/" + twoDigitMonth + "/" + fullDate.getDate();
		var object = new Object();
  	object.createddate = currentDate;
		object.userid="";
		object.name=profile.displayName;
		if(profile.emails && profile.emails[0])
		{	
			object.email=profile.emails[0].value;
		}
		else 
		{
			object.email = "";
		}
		object.provider="google";
		if(profile.photos && profile.photos[0])
			object.photourl=profile.photos[0].value;
		else
			object.photourl= AppUrl + "images/no-pic.png";
		if(object.email != "")
 		{
		User.find(object, function (err, usr) {
		  if (err) console.log(err);
		  if (usr._node[0]){
				console.log("User<<<<<<<",usr._node[0]);
				return done(null, usr._node[0]);       	
		  	}else{
				createUser(object, function(usr){
					return done(null, usr);  
				});	      	
		  	}     	
		});
		}
		else
		{
			return done(null, object); 
		}
	   }); 
	  }
	));

	passport.use(new LinkedInStrategy({
	    clientID: LINKEDIN_API_KEY,
	    clientSecret: LINKEDIN_SECRET_KEY,
	    callbackURL: LinkedInCallbackUrl,
	  	scope: ['r_emailaddress', 'r_basicprofile']
    }, function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
        var fullDate = new Date();//Thu May 19 2011 17:25:38 GMT+1000 {}
			  //convert month to 2 digits
			  var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1);
			  var currentDate =  fullDate.getFullYear() + "/" + twoDigitMonth + "/" + fullDate.getDate();
          var object = new Object();
      	object.createddate = currentDate;
	      object.userid=profile.id;
	      object.name=profile.displayName;
	      if(profile.emails && profile.emails[0])
	      {
	      		object.email=profile.emails[0].value;
	  	  }
	  	  else
	  	  {
	  	  		object.email= "";
	  	  }
	      object.provider="linkedin";
	     if(profile.photos && profile.photos[0])
			object.photourl=profile.photos[0].value;
		 else
			object.photourl= AppUrl + "images/no-pic.png";
			if(object.email != "")
 			{
	    User.find(object, function (err, usr) {
		  if (err) console.log(err);
		  if (usr._node[0]){
				console.log("User<<<<<<<",usr._node[0]);
				return done(null, usr._node[0]);       	
		  	}else{
				createUser(object, function(usr){
					return done(null, usr);  
				});	      	
		  	}     	
		});
	    	}
	    	else
	    	{
	    		return done(null, object);
	    	}
	   }); 
	  }
	));

	passport.use(new LocalStrategy(
	  function(username, password, done) {
	    User.findByName({ username: username, password: password }, function(err, user) {
	      if (err) { return done(err); }
	      if (!user) {
	        return done(null, false, { message: 'Incorrect username or password.' });
	      }	      
	      console.log("\n\n\n", user);
	      return done(null, user._node[0]);
	    });
	  }
	));


  passport.serializeUser(function(user, done) {
	console.log(user);
	done(null,user);
  });


    function createUser(user,callback){
		User.create(user, function (err, new_usr) {
		      if (err){ 
		      	console.log(err);
		      	done(null, null);  
		      }else{
				callback(new_usr);
		      }      
		  });
    }        

	passport.deserializeUser(function(obj, done) {
	  done(null, obj);
	});	
};