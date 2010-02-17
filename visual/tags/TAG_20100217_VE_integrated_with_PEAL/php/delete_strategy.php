<?php
// this can also be used for unchecking public files
$ispublic = $_POST['ispublic'];
$fname = $_POST['filename'];

include_once("login_functions.php");
session_start();

// if no session then $_SESSION['username'] will be blank, giving false
// if there is a session but incorrect username it'll give false
if(!checkUser($_SESSION['username'])) {
	//header("Location: ../index.php?timeout");
	echo "Timeout";
	exit;
}

$uname = $_SESSION['username'];
$uname = encrypt($uname);
$fpath = "../users/";
if ($ispublic == "true") {
	$fpath = $fpath . "public/$fname";
} else {
	$fpath = $fpath . "$uname/$fname";
}
if (file_exists($fpath)) {
	// get file owner
	// compare owners
	if (openAndGetOwner($fpath, $uname)) {
		if (unlink($fpath)) {
			echo "true";
		} else {
			echo "false";
		}
	} else {
		echo "false";
	}
}

// opens the file
function openAndGetOwner($path, $uname) {
  if (file_exists($path)) {
	$doc = new DomDocument();
    $doc->load($path);
  
	$users = $doc->getElementsByTagName( "user" );
	$user = $users->item(0)->nodeValue;
	
	if ($uname != encrypt($user)) {
		return false;
	} else {
		return true;
	}
  } else {
	return false;
  }
}
?>