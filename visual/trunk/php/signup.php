<?php
include_once("login_functions.php");

$u = $_POST['username'];
$p = $_POST['password'];

if ($u != "" && $p != "" && !stripos($u, "'") && !stripos($p, "'") && !stripos($p, "\\") && !stripos($u, "\\") && !stripos($p, ";") && !stripos($u, ";")) {
	if (!checkUser($u)) {
		if (createUser($u, encrypt($p))) {
			// user created
			//header ("Location: index.php?usercreated");
			header("Location: ../login.php?username=$u&password=$p");
		} else {
			// couldn't create user
			header ("Location: ../index.php?usernotcreated");
		}
	} else {
		header ("Location: ../index.php?userexists");
	}
} else {
	header("Location: ../index.php?usernotcreated");		
}

?>