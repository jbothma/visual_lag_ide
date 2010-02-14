<?php

function connectToDB() {
	include("db_config.php");
	$db_connection_link = mysql_connect($db_server, $db_username, $db_password) or die(mysql_error());
	mysql_select_db($db_name) or die(mysql_error());
	return $db_connection_link;
}

function disconnectFromDB($db_connection_link) {
	mysql_close($db_connection_link);
}

?>