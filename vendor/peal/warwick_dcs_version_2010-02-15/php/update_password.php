<?php

include_once("login_functions.php");

if (isset($_POST['tmp']) && isset($_POST['new']) && isset($_POST['username'])) {
$u = $_POST['username'];
$p = $_POST['new'];
$t = $_POST['tmp'];

	if (checkUser($u)) {
		$h = getUserHash($u);
		$dbp = getUserPassword($u);
		$dbt = getTempPassword($u);
		if (compare($t.$h, $dbp) && $dbp == $dbt) {
			
			$np = pencrypt($p.$h);
			//update database
			$db_conn = connectToDB();
			$query = $db_conn->prepare("UPDATE user SET password = ?, t_password = NULL WHERE username= ?;");
			if(!$query)
				error_log($db_conn->error);
			$query->bind_param("ss",$np, $u);
			$query->execute() or die("Couldn't update password");
			disconnectFromDB($db_conn);
			
			//login
			header("Location: login.php?username=$u&password=$p");
		} else {
			header("Location: ../index.php?wrongdetails");
		}
	} else {
		header("Location: ../index.php?nouser");
	}
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>PEAL - version 0.5.5</title>
    <link rel="stylesheet" type="text/css" href="../css/docs.css"/>
  </head>
  <body style="padding: 20px;">

    <?php
	if (isset($_GET['emailed'])) {
		echo "A new temporary password has been emailed to you, please check your email inbox and junk folders.<br/>";
	}
	?>
  
  	<p>PEAL - version 0.5.5: Update Password</p>
	<form id="login" action="update_password.php" method="post">
		Temporary Password: <input type="text" name="tmp" /></br>
		New Password: <input type="password" name="new" /></br>
		<input type="hidden" name="username" value="<?php echo $_GET['u']; ?>" />
		<input type="submit" value="Set New Password and Login" />
	</form>
	
	<a href="../index.php">Home</a>
	
  </body>
</html>
