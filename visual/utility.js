function isset(variable)
{
	return ( typeof(variable) == "undefined" || variable == null )?  false: true;
}