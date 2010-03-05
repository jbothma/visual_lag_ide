<?php
include_once("peal_config.php");
include_once("login_functions.php");

$u = $_POST['username'];

if (isset($u) && checkUser($u)) {
	
	$h = getUserHash($u);
	$tp = randomString();
	$tep = pencrypt($tp.$h);
	
	$db_conn = connectToDB();	
	$query = $db_conn->prepare("UPDATE user SET password= ?, t_password= ? WHERE username= ?");
	$query->bind_param("sss",$tep,$tep,$u);
	$query->execute();
	disconnectFromDB($db_conn);
	
	$to = $u;
	$subject = "PEAL New Password";
	$message = "Your new password for " . $peal_version_string . " at " . $_SERVER["SERVER_NAME"] . " is: $tp";
	$from = "postmaster@" . $_SERVER["SERVER_NAME"];
	$mail_headers = "From: PEAL";
	mail($to,$subject,$message,$mail_headers);

	header("Location: update_password.php?emailed&u=$u");
} else {
	header("Location: ../index.php?nouser");
}

?>
