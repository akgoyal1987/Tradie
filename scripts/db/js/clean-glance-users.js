userIterator = db.users.find({},{username:1});
while ( userIterator.hasNext() ) {
	var user = userIterator.next();
	if (user.username == 'catapultyoursel'
		||user.username == 'Chris Lyman'
		||user.username == 'Anthony Wentzel'
		||user.username == 'tofulovesbones')
	{
		print( "User, " + user._id.str + " and videos removed");
		db.videos.remove({userId: user._id.str});
		db.users.remove({_id: user._id});	
		//printjson( cursor.next() );
	}
}