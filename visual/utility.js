function isset(variable)
{
	return ( typeof(variable) == "undefined" || variable == null )?  false: true;
}

/**
 * Make function to allow each use of YUI3 to use the same YUI instance.
 */
function getMyY() {
	if (typeof(myY) != "undefined" && myY != null) {
		//alert('myY was set, returning.');
		return myY;
	} else {
		//alert('no myY, creating and returning.');
		// Create global YUI3 instance
		myY = YUI({ filter:'raw' });
		return myY;
	}
}
