<?php
function compare($a, $b) {
	// supplied with <user input password+db hash>, <db password>
	return (pencrypt($a) == $b);
}

function encrypt($p) {
	return md5($p . "random_salt");
}
function pencrypt($p) {
	return md5($p);
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
	
	$query = $db_conn->prepare("SELECT username FROM user WHERE username = ?");
	$query->bind_param("s",$uname);
	$query->bind_result($username);
	$query->execute();
	$query->fetch();
	
	disconnectFromDB($db_conn);
	
	return ($uname == $username);
}

function createUser($u, $p, $hash) {
	include_once("db_functions.php");
		
	$db_conn = connectToDB();

	$query = $db_conn->prepare("INSERT INTO user (username, password, hash) VALUES (?, ?, ?)");
	$query->bind_param("sss", $u, $p, $hash);
	$result = false;
	if($query->execute()){
		$result = true;
	}
	disconnectFromDB($db_conn);

	$created = mkdir("../users/" . encrypt($u));
	
	return ($result && $created);
}
function getUserHash($u) {
	$db_conn = connectToDB() or die("Didn't connect to DB");
	
	$query = $db_conn->prepare("SELECT hash FROM user WHERE username = ?") or trigger_error("Preparing query failed." . $mysqli->error);
	$query->bind_param("s", $u);
	$query->bind_result($hash);
	$query->execute();
	$query->fetch();
	disconnectFromDB($db_conn);

	return $hash;
}
function getUserPassword($u) {
	$db_conn = connectToDB();
	
	$query = $db_conn->prepare("SELECT password FROM user WHERE username = ?");
	$query->bind_param("s",$u);
	$query->bind_result($p);
	$query->execute();
	$query->fetch();

	disconnectFromDB($db_conn);
	return $p;
}

function getTempPassword($u) {
	$db_conn = connectToDB();
	
	$query = $db_conn->prepare("SELECT t_password FROM user WHERE username = ?");
	$query->bind_param("s",$u);
	$query->bind_result($p);
	$query->execute();
	$query->fetch();

	disconnectFromDB($db_conn);

	return $p;
}
?>
