<?php

include_once("db_functions.php");
include_once("login_functions.php");

if (isset($_POST['password']) && isset($_POST['username'])) {
	$u = $_POST['username'];
	$p = $_POST['password'];
} else {
	// just in case, and also for post-registering logging in
	$u = $_GET['username'];
	$p = $_GET['password'];
}

if ($u != "" && $p != "") {
	if (!stripos($u, "'") && !stripos($p, "'") && !stripos($p, "\\") && !stripos($u, "\\") && !stripos($p, ";") && !stripos($u, ";")) {
		login($u, $p);
	} else {
		header("Location: ../index.php?wrongdetails");		
	}
} else {
	header("Location: ../index.php?wrongdetails");
}

function login($u, $p) {
	if (checkUser($u)) {
		$user_pass = getUserPassword($u);
		if ($user_pass !== false) {
			// Must supply the unencrypted password first, then the one from the database
			if (compare($p, $user_pass)) {
				include_once("session_functions.php");
				createSession($u);
				header ("Location: ../editor.php");
			} else {
				// wrong password
				header ("Location: ../index.php?wrongpassword");
			}
		} else {
			// no password for that user
			header ("Location: ../index.php?nouserpassword");
		}
	} else {
		// no user
		header ("Location: ../index.php?nouser");
	}
}

function getUserPassword($u) {
	$db_conn = connectToDB();
	
	$query = "SELECT password FROM user WHERE username='$u'";
	$result = mysql_query($query) or die(mysql_error());
	$row = mysql_fetch_array($result);

	disconnectFromDB($db_conn);

	if (mysql_num_rows($result) <= 0) {	
		return false;
	} else {
		return $row[0];
	}
}

?>
