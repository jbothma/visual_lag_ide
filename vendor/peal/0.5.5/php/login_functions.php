<?php
function compare($a, $b) {
	return (encrypt($a) == $b);
}

function encrypt($p) {
	return md5($p . "random_salt");
}

function randomString() {

	$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	//$num = rand(0, strlen($chars));
	$s_id = "";

	for ($i=0; $i<16; $i++) {
		$num = rand(0, strlen($chars));
		$s_id .= $chars{$num};
	}
	return $s_id;
}

function checkUser($uname) {
	include_once("db_functions.php");
	
	$db_conn = connectToDB();
	
	$query = "SELECT username FROM user WHERE username='$uname'";
	$result = mysql_query($query) or die(mysql_error());

	disconnectFromDB($db_conn);

	if (mysql_num_rows($result) <= 0) {	
		return false;
	} else {
		return true;
	}
}

function createUser($u, $p) {
	include_once("db_functions.php");
	
	$db_conn = connectToDB();

	$query = "INSERT INTO user (username, password) VALUES ('$u', '$p')";
	$result = mysql_query($query);

	disconnectFromDB($db_conn);

	$created = mkdir("../users/" . encrypt($u));
	
	return ($result && $created);
}
?>