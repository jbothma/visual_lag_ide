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

		$query = $db_conn->prepare("UPDATE user SET s_id = ? WHERE username= ?");
		$query->bind_param("ss",$rndStr,$u);
		$query->execute() or die("Couldn't update session");

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

			$query = $db_conn->prepare("SELECT s_id FROM user WHERE username=?");
			$query->bind_param("s", $uname);
			$query->bind_result($sid);
			$query->execute() or die("Couldn't get sessionid");
			$query->fetch();	
			disconnectFromDB($db_conn);

			return ($sid == $_SESSION['s_id']);
		} else {
			return false;
		}
	}
}

?>
