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

/**
 * Add peek() to the Javascript Array prototype
 * Returns the top of the stack or null
 * if the stack is empty without pop()ing it off.
 * http://ajax.sys-con.com/node/347048 accessed 06/02/2010
 * Reprint of Real-World AJAX: Secrets of the Masters published by SYS-CON ISBN 0-9777622-0-3 
 */
Array.prototype.peek = function(){
    if (this.length > 0){
        return this[this.length - 1];
    } else {
        return null;
    }
}