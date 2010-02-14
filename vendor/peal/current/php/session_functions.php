<?php
include_once("db_functions.php");

function createSession($u) {

	// DISALLOW CREATING A NEW SESSION IF ONE ALREADY EXISTS FOR THIS USER...
	// THEN NEED TO ENSURE SESSION IS DELETED WHEN BROWSER CLOSED OR LOGOUT...??
	//if (!checkSession()) {		
		$rndStr = randomString();
		session_start();
	
		$_SESSION['username'] = $u;
		$_SESSION['s_id'] = $rndStr;
		
		$db_conn = connectToDB();

		$query = "UPDATE user SET s_id='$rndStr' WHERE username='$u'";
		$result = mysql_query($query) or die(mysql_error());

		disconnectFromDB($db_conn);
	//}
}

function checkSession() {
	include_once("login_functions.php");
	
	session_start();
	
	if (!isset($_SESSION['username']) && !isset($_SESSION['s_id'])) {
		return false;
	} else {
		$uname = $_SESSION['username'];
		
		if (checkUser($uname)) {
			$db_conn = connectToDB();

			$query = "SELECT s_id FROM user WHERE username='$uname'";
			$result = mysql_query($query) or die(mysql_error());
			$row = mysql_fetch_array($result);
	
			disconnectFromDB($db_conn);

			return ($row[0] == $_SESSION['s_id']);
		} else {
			return false;
		}
	}
}

?>