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

$fn = $_POST['filename'];
$public = $_POST['ispublic'];

if (isset($public) && isset($fn)) {
	if ($public == "false") {
		$un = encrypt($_SESSION['username']);
		openAndRead("../users/$un/$fn");
	} else if ($public == "true") {
		openAndRead("../users/public/$fn");
	}
}

function openAndRead($path) {
  if (file_exists($path)) {
	//if (phpversion() >= '5.0.0') {
		$doc = new DomDocument();
		$doc->load( $path );
	  
		$codes = $doc->getElementsByTagName( "code" );
		$code = $codes->item(0)->nodeValue;
		
		$users = $doc->getElementsByTagName( "user" );
		$user = $users->item(0)->nodeValue;
	/*} else {
		$fp = file_open($path, 'r');
		$data = fread($fp);
		$parser = xml_parser_create('UTF-8');
		xml_parser_set_option($parser, XML_OPTION_SKIP_WHITE, 1); 
		xml_parse_into_struct($parser, $data, $vals, $index); 
		xml_parser_free($parser);
		...
	}*/
	//if (encrypt($user) == ) {
	//	possibility here for setting semi-permissions or something if the current user wasnt the original author...
	//}
	
	echo $code;
  } else {
	echo "Cancel";
  }
}

?>