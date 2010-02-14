<?php
include_once("login_functions.php");
session_start();

// if no session then $_SESSION['username'] will be blank, giving false
// if there is a session but incorrect username it'll give false
if(!checkUser($_SESSION['username'])) {
	//header("Location: ../index.php?timeout");
	echo "Timeout";
	exit;
}

$isPublic = $_GET['public'];

if (isset($isPublic)) {
	if ($isPublic == "true") {
		// get public files
		$dir = dir("../users/public/");
		$filelist = "";
		while (($file = $dir->read()) !== false) {
			if ($file != "." && $file != ".." && eregi(".xml", $file)) {
				//echo '<option>' . substr($file, 0, -4) . '</option>' . "\r\n";
				$filelist .= substr($file, 0, -4) . ",";
			}
		}
		$dir->close();
		echo $filelist;
	} else {
		$uname = $_SESSION['username'];
		$uname = encrypt($uname);
		// get users files
		$dir = dir("../users/$uname/");
		// check for folder existence
		if (file_exists($dir->path)) {
			$filelist = "";
			while (($file = $dir->read()) !== false) {
				if ($file != "." && $file != ".." && eregi(".xml", $file)) {
					//echo '<option>' . substr($file, 0, -4) . '</option>' . "\r\n";
					$filelist .= substr($file, 0, -4) . ",";
				}
			}
			$dir->close();
			echo $filelist;
		} else {
			echo "";
		}
	}	
} else {
	echo "";
}

?>