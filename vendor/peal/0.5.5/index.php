<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>PEAL - version 0.5.5</title>
    <link rel="stylesheet" type="text/css" href="css/docs.css"/>
  </head>
  <body style="padding: 20px;">
  <?php
	if (isset($_GET['wrongpassword'])) {
		echo "<b>Sorry, that password doesn't match the username.</b>\n<br>\n";
	}
	if (isset($_GET['nouserpassword'])) {
		echo "<b>Sorry, there doesn't seem to be a password for that username.</b>\n<br>\n";
	}	
	if (isset($_GET['nouser'])) {
		echo "<b>Sorry, that user doesn't exist.</b>\n<br>\n";
	}
	if (isset($_GET['wrongdetails'])) {
		echo "<b>Sorry, those details don't match our database.</b>\n<br>\n";
	}
	if (isset($_GET['usercreated'])) {
		echo "<b>Thanks, please sign in below.</b>\n<br>\n";
	}
	if (isset($_GET['usernotcreated'])) {
		echo "<b>Sorry, those details could not be registered on our system.</b>\n<br>\n";
	}
	if (isset($_GET['userexists'])) {
		echo "<b>Sorry, that username already exists.</b>\n<br>\n";
	}
	if (isset($_GET['timeout'])) {
		echo "<b>Sorry, your login session has timed-out for security reasons. Please login again.</b>\n<br>\n";
	}
  ?>
	<p>PEAL - version 0.5.5: Login</p>
	<form id="login" action="php/login.php" method="post">
		Username: <input type="text" name="username" maxlength="40" />
		Password: <input type="password" name="password" /><br>
		<input type="submit" value="Login" />
	</form>
	<br/>
	<p>PEAL - version 0.5.5: Signup</p>
	<form id="signup" action="php/signup.php" method="post">
		Username: <input type="text" name="username" maxlength="40" />
		Password: <input type="password" name="password" /><br>
		<input type="submit" value="Signup" />
	</form>

  </body>
</html>
