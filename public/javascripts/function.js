function publishAd(adid)
{	
	jQuery.post( "/publishad?id=" + adid, function( data ) {
  		if(data.success)
		{
			jQuery("#hl_unpublish_" + adid).removeClass("toggle");
			jQuery("#hl_publish_" + adid).addClass("toggle");
		}
	});
}

function unpublishAd(adid)
{	
	jQuery.post( "/unpublishad?id=" + adid, function( data ) {
  		if(data.success)
		{
			jQuery("#hl_publish_" + adid).removeClass("toggle");
			jQuery("#hl_unpublish_" + adid).addClass("toggle");
		}
	});
}

function addAdToWatchlist(adid)
{	
	jQuery.post( "/addtowatchlist?id=" + adid, function( data ) {
  		if(data.success)
		{
			window.location.href = window.location;
		}
	});
}

function removeAdFromWatchlist(adid)
{	
	jQuery.post( "/removefromwatchlist?id=" + adid, function( data ) {
  		if(data.success)
		{
			window.location.href = window.location;
		}
	});
}

function markAdFeatured(adid)
{	
	jQuery.post( "/markfeatured?id=" + adid, function( data ) {
  		if(data.success)
		{
			jQuery("#hl_unfeatured_" + adid).removeClass("toggle");
			jQuery("#hl_featured_" + adid).addClass("toggle");
		}
	});
}

function markAdUnFeatured(adid)
{	
	jQuery.post( "/markunfeatured?id=" + adid, function( data ) {
  		if(data.success)
		{
			jQuery("#hl_featured_" + adid).removeClass("toggle");
			jQuery("#hl_unfeatured_" + adid).addClass("toggle");
		}
	});
}

function markAdRecommended(adid)
{	
	jQuery.post( "/recommendad?id=" + adid, function( data ) {
  		if(data.success)
		{
			jQuery("#hl_unrecommended_" + adid).removeClass("toggle");
			jQuery("#hl_recommended_" + adid).addClass("toggle");
		}
	});
}

function markAdUnRecommended(adid)
{	
	jQuery.post( "/unrecommendad?id=" + adid, function( data ) {
  		if(data.success)
		{
			jQuery("#hl_recommended_" + adid).removeClass("toggle");
			jQuery("#hl_unrecommended_" + adid).addClass("toggle");
		}
	});
}