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

// Grab the necessary variables - the source code, the username, whether the code is public or not, any supplied filename and the current time of saving
$code = stripslashes($_POST['code']);
$folder = encrypt($_SESSION['username']);
$fileName = $_POST['filename'];
$fileTime = $_GET['time'];

// Create an XML file with the username, time and sourcecode
/* if (phpversion() < '5.0.0') {
	// PHP 4.x code
	$doc = domxml_new_doc('1.0');
	$root = $doc->create_element('root');
	$root = $doc->append_child($root);

	$u = $doc->create_element('user');
	$u = $root->append_child($u);
	$u_child = $doc->create_text_node($_SESSION['username']);
	$u_child = $u->append_child($u_child);

	$t = $doc->create_element('time');
	$t = $root->append_child($t);
	$t_child = $doc->create_text_node($fileTime);
	$t_child = $t->append_child($t_child);

	$c = $doc->create_element('code');
	$c = $root->append_child($c);
	$c_child = $doc->create_text_node($code);
	$c_child = $c->append_child($c_child);

	$xml_string = $doc->dump_mem(true);
} else { */
	// PHP 5.x code
	$doc = new DomDocument('1.0');
	$root = $doc->createElement('root');
	$root = $doc->appendChild($root);

	$u = $doc->createElement('user');
	$u = $root->appendChild($u);
	$u_child = $doc->createTextNode($_SESSION['username']);
	$u_child = $u->appendChild($u_child);

	$t = $doc->createElement('time');
	$t = $root->appendChild($t);
	$t_child = $doc->createTextNode($fileTime);
	$t_child = $t->appendChild($t_child);

	$c = $doc->createElement('code');
	$c = $root->appendChild($c);
	$c_child = $doc->createTextNode($code);
	$c_child = $c->appendChild($c_child);

	$xml_string = $doc->saveXML();
//}

// If the supplied fileName is blank
if ($fileName == "") {
	// Create a new fileName
	$fileName = "temp" . time() . ".frag";
}

// Create a relative file path
$file = "../users/public/" . $fileName;

// Check for file existence for another user if its public
if (file_exists($file)) {
	// open file, check user against this user
	// reject if not the same...
	
	//if (phpversion() >= '5.0.0') {
		$doc = new DomDocument();
		$doc->load( $file );
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
	} */
	
	if ($user != $_SESSION['username']) {
		echo "<span style=\"color: red;\">Could not save fragment, another user has already created a fragment with the same name.</span>";
		exit;
	}
}

// Open the file for EITHER private and public
$fileHandle = fopen($file, 'w') or die("Can't open file.");

// Write the xml into the required files
if (fwrite($fileHandle, $xml_string) !== false) {
	fclose($fileHandle);
	echo "<span style=\"color: green;\">Fragment saved OK. Filename: " . $fileName . "</span>";
} else {
	fclose($fileHandle);
	echo "<span style=\"color: red;\">Could not save fragment...</span>";
}
?>