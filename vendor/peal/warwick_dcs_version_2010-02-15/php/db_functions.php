<?php

function connectToDB() {
	include("db_config.php");
	$mysqli = mysqli_init();
	$mysqli->real_connect($db_server, $db_username, $db_password,$db_name,$db_port) or die("Error connection mysqli");
	return $mysqli;
}

function disconnectFromDB($db_connection_link) {
	$db_connection_link->close();
}

?>
