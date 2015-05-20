// Draw routes.  Locomotive's router provides expressive syntax for drawing
// routes, including support for resourceful routes, namespaces, and nesting.
// MVC routes can be mapped to controllers using convenient
// `controller#action` shorthand.  Standard middleware in the form of
// `function(req, res, next)` is also fully supported.  Consult the Locomotive
// Guide on [routing](http://locomotivejs.org/guide/routing.html) for additional
// information.
module.exports = function routes() {
  this.root('pages#home');
/*********************************
  *****Pages Controller******
  *********************************/
  this.get('pages/:pg', 'pages#navpage');
  this.get('signup','pages#register');
  this.get('signin','pages#signin');

  /*********************************
  *****Authenticate Controller******
  *********************************/
  this.get('auth/facebook', 'auth#facebook');
	this.get('auth/facebook/callback', 'auth#facebookcallback');
  this.get('auth/twitter', 'auth#twitter');
  this.get('auth/twitter/callback', 'auth#callbackTwitter');
  this.get('auth/google', 'auth#google');
  this.get('auth/google/return', 'auth#returngoogle');
  this.get('auth/linkedin','auth#linkedin');
  this.get('auth/linkedin/callback','auth#linkedincallback');
  this.post('adminlogin','auth#adminlogin');
  this.post('weblogin','auth#weblogin');
  this.get('logout','auth#logout');
  this.get('adminlogout','auth#adminlogout');

	/**********************************
  *********Users Controller**********
  **********************************/
  this.resources('users');
  this.post('register','users#registeruser');
  this.get('people','users#people');
  this.get('follow/:id','users#follow');
  this.get('unfollow/:id','users#unfollow');
  this.get('followings/:id','users#following');
  this.get('followers/:id','users#follower');
  this.get('profile/:id','users#getProfile');
  this.get('recommendations/:id','users#getrecommendations');
  this.get('watchlists/:id','users#getwatchlist');
//  this.get('previewuserad','users#previewuserad');
  this.get('userad','users#userad');
  this.get('logintype','users#logintype');
  this.post('logintype','users#saveusertypeads');
  this.post('publishad','users#publishAd');
  this.post('unpublishad','users#unpublishAd');
  this.get('deletead','users#deleteAd');
  this.post('addtowatchlist','users#addtowatchlist');
  this.post('removefromwatchlist','users#removefromwatchlist');
  this.get('editprofile','users#editprofile');

	/************************************
	*********Postads Controller**********
	************************************/  
  this.resources('postads');
  this.post('createuserads','postads#saveuserads');
  this.get('findservice','postads#findservice');

  this.get('viewbusinessad','postads#viewbusinessad');
  this.get('createbusinessad','postads#createbusinessad');
  this.post('createbusinessad','postads#savebusinessad');
  this.get('previewbusinessad','postads#previewbusinessad');
  this.get('publishbusinessad','postads#publishbusinessad');
  this.get('editbusinessad','postads#editbusinessad');
  this.post('editbusinessad','postads#saveeditbusinessad');
  this.get('writereview/:id','postads#writereview');
  this.post('writereview/:id','postads#savereview');

  this.get('userad','userad#createuserads');
  this.get('search','postads#searchAds');
  this.post('search','postads#showSearchResults');

  this.get('viewuserad','postads#viewuserad');
  this.get('createuserad','postads#createuserad');
  this.post('createuserad','postads#saveuserad');  
  this.get('previewuserad','postads#previewuserad');
  this.get('publishuserad','postads#publishuserad');
  this.get('edituserad','postads#edituserad');
  this.post('edituserad','postads#saveedituserad');  
  this.get('userad','userad#createuserads');
  this.post('recommendad','postads#recommendad');
  this.post('unrecommendad','postads#unrecommendad');
  this.post('recommendadtouser','postads#recommendadtouser');
  this.post('adreply/:adid', 'postads#adreply');
 
  
  /************************************
  *********Admin Controller**********
  ************************************/  
  //this.resources('admin'); 
  this.get('admin','admin#index');
  this.post('adminlogin','admin#index');
  this.get('admin/tradesman','admin#tradesman');
  this.get('admin/users','admin#index');
  this.get('admin/spamads','admin#showspamads');
  this.get('admin/viewads/:id','admin#viewads');
  this.get('admin/featuredads','admin#featuredads');
  this.post('markfeatured','admin#markfeatured');
  this.post('markunfeatured','admin#markunfeatured');
  this.get('admin/pages','admin#getpages');
  this.get('admin/page','admin#page');
  this.post('admin/createpage','admin#createpage');
  this.get('admin/deletead', 'admin#deletead');
  this.get('admin/categories', 'admin#categories');
  this.get('admin/advertisedby', 'admin#advertisedby');
  this.get('admin/jobtypes', 'admin#jobtypes');  
  this.get('admin/locations', 'admin#locations');  
  this.post('admin/addcategory', 'admin#addcategory');
  this.post('admin/relateCategories', 'admin#relateCategories');
  this.post('admin/addadvertisedby', 'admin#addadvertisedby');
  this.post('admin/addjobtypes', 'admin#addjobtypes');
  this.post('admin/addlocation', 'admin#addLocation');
  this.get('admin/deleteitem', 'admin#deleteitem');
  this.get('admin/edititem', 'admin#edititem');
  this.post('admin/edititem', 'admin#updateitem');
  this.post('blockad/:adid', 'admin#blockad');
  this.post('unblockad/:adid', 'admin#unblockad');

}
