<?php
    include_once("php/peal_config.php");
    
	// get db_config details
	// set up a connection, request details from the server of the table
	// print error if fail, otherwise store details in db_config.php and print A-OK
	
	if (isset($_POST['serveradd']) && isset($_POST['dbname']) && isset($_POST['dbuname']) && isset($_POST['dbpass'])) {
		$db_server = $_POST['serveradd'];
		$db_name = $_POST['dbname'];
		$db_username = $_POST['dbuname'];
		$db_password = $_POST['dbpass'];
		
		$db_connection_link = mysql_connect($db_server, $db_username, $db_password);
		if ($db_connection_link) {
			$db_sel = mysql_select_db($db_name);
			if ($db_sel) {
				$query = "SELECT * FROM user";
				$result = mysql_query($query);
				if ($result) {
					$row = mysql_fetch_array($result);
					$db_details = "<?php\n\$db_password = \"$db_password\";\n\$db_username = \"$db_username\";\n\$db_name = \"$db_name\";\n\$db_server = \"$db_server\";\n?>";
					$fileHandle = fopen("php/db_config.php", 'w') or die("Can't open file.");
					// Write the details into the required file
					if (fwrite($fileHandle, $db_details) !== false) {
						fclose($fileHandle);
						chmod("./users/", 0707);
						header ("Location: install.php?ok");
					} else {
						fclose($fileHandle);
						header ("Location: install.php?nosave");
					}
				} else {
					header("Location: install.php?notable");
				}
			} else {
				header ("Location: install.php?nodb");				
			}
		} else {
			header ("Location: install.php?noconnect");
		}		
	}

?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title><?php echo $peal_version_string;?></title>
    <link rel="stylesheet" type="text/css" href="css/docs.css"/>
  </head>
  <body style="padding: 20px;">
  	<h3><?php echo $peal_version_string;?>: Installation</h3>
	<p>In order for PEAL to work on your server you need to set up a simple database.</p>
	<p>You can use the following SQL to create your database or do it manually following the same structure.</p>
	<code>CREATE TABLE user (<br/>
			username VARCHAR(40) PRIMARY KEY,<br/>
			password VARCHAR(32) NOT NULL,<br/>
			s_id VARCHAR(32),<br/>
			t_password VARCHAR(32),<br/>
			hash VARCHAR(32) NOT NULL)
	</code>
	<br/>
	<p>Once you have created this table you need to insert your database details below so that the PEAL system can access the database.</p>
	<form method="POST" action="install.php" >
		Server Address: <input type="text" name="serveradd" /><br/>
		Database Name: <input type="text" name="dbname" /><br/>
		Database Username: <input type="text" name="dbuname" /><br/>
		Database Password: <input type="text" name="dbpass" /><br/>
		<input type="submit" value="Test Database Details" />
	</form>
	<?php
		if (isset($_GET['ok'])) {
			echo "<p>Everything seems to be set up working ok now!<br/>To start using PEAL go to <a href=\"index.php\">index.php</a> and sign up.</p>";
		} else if (isset($_GET['nodb']) || isset($_GET['notable']) || isset($_GET['noconnect'])) {
			echo "<p>Please check your database details again and ensure you have created the table as shown above.</p>";
		} else if (isset($_GET['nosave'])) {
			echo "<p>The database seems to be working ok, but the database details could not be saved.<br/>Please check that install.php has CHMOD permissions of 0644 and that the directory has CHMOD permissions 0707.</p>";
		}
	?>
  </body>
</html>
