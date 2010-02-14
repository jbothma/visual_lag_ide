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

// get public files
$dir = dir("../users/public/");
$filelist = "";
while (($file = $dir->read()) !== false) {
	if ($file != "." && $file != ".." && eregi(".frag", $file)) {
		//echo '<option>' . substr($file, 0, -4) . '</option>' . "\r\n";
		$filelist .= substr($file, 0, -5) . ":";
		
		// get a chunk of the code fragment
		$doc = new DomDocument();
		$doc->load( $dir->path.$file );
		$codes = $doc->getElementsByTagName( "code" );
		$code = $codes->item(0)->nodeValue;
		
		$filelist .= substr($code, 0, 100) . "@";
	}
}
$dir->close();
echo $filelist;

?>