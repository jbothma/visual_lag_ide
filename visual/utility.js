function isset(variable)
{
	return ( typeof(variable) == "undefined" || variable == null )?  false: true;
}

function getMyY() {
	if (typeof(myY) != "undefined" && myY != null) {
		//alert('myY was set, returning.');
		return myY;
	} else {
		//alert('no myY, creating and returning.');
		// Create global YUI3 object
		myY = YUI({ filter:'min' });
		return myY;
	}
}