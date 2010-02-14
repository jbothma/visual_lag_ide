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

$uname = encrypt($_SESSION['username']);
$fname = $_GET['filename'];
$ispublic = $_GET['ispublic'];

if ($fname != "" && $ispublic != "") {
	if ($ispublic == "true") {
		openAndWrite("../users/public/$fname", $uname, $fname);
	} else if ($ispublic == "false") {
		openAndWrite("../users/$uname/$fname", $uname, $fname);
	} else {
		echo "No file...";
	}
} else {
	echo "Uh-oh...";
}

function openAndWrite($path, $uname) {
  if (file_exists($path)) {
	$doc = new DomDocument();
    $doc->load( $path );
  
	$codes = $doc->getElementsByTagName( "code" );
	$code = $codes->item(0)->nodeValue;
	
	$users = $doc->getElementsByTagName( "user" );
	$user = $users->item(0)->nodeValue;
	
	// check user/owner
	if ($uname == encrypt($user)) {
		// place code into new file in tmp folder with ext of .lag
		$ourFileName = substr($path, 0, -4) . ".lag";
		$ourFileHandle = fopen($ourFileName, 'w') or die("Can't open file");
		fwrite($ourFileHandle, $code);
		fclose($ourFileHandle);
		// call download function on that
		force_download(substr($path, 0, -4) . ".lag");
	} else {
		echo "No user match...<br>\n<br>\n$uname<br>\n<br>\n$user: " . encrypt($user);
	}
  } else {
		echo "No file...";
  }
}
function force_download($file) 
{
    $dir = "../";
    if ((isset($file)) && (file_exists($dir.$file))) {
       header("Content-type: application/force-download"); 
       header('Content-Disposition: inline; filename="' . $dir.$file . '"'); 
       header("Content-Transfer-Encoding: Binary"); 
       header("Content-length: ".filesize($dir.$file)); 
       header('Content-Type: application/octet-stream'); 
       header('Content-Disposition: attachment; filename="' . substr($file, strripos($file, "/")+1) . '"'); 
       readfile("$dir$file"); 
    } else {
       echo "No file selected"; 
    }
}
?>