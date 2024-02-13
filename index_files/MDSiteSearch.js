function GoogleSearch() {
			    		
var searchText = document.getElementById('searchInputBox').value;
	if (searchText == null) 
	{
		return false;
	}

	else{
	    var link = "http://www.maryland.gov/pages/search.aspx?" + "q=" + searchText + "&site=	hdc4rgpagp8" + "&name=Housing and Community Development";
		window.open(link, "_self");
		return false;
	     }
 }

 function onEnter(e) {
			if (e.keyCode == 13)
			{
			GoogleSearch();
			return false;
			}
			else{ return true;}   
			 }
			    