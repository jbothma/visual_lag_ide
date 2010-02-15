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
		$user_hash = getUserHash($u);
		$user_temp = getTempPassword($u);
		if ($user_pass !== false && $user_hash !== false) {
		
			//Check against temporary passwords
			if ($user_temp == "") {
				// Must supply the unencrypted password first, then the one from the database
				if (compare($p.$user_hash, $user_pass)) {
					include_once("session_functions.php");
					createSession($u);
					header ("Location: ../editor.php");
				} else {
					// wrong password
					header ("Location: ../index.php?wrongpassword");
				}
			} else {
				header("Location: update_password.php?u=$u");
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

?>