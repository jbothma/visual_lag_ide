<?php
    include_once("peal_config.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title><?php echo $peal_version_string;?></title>
    <link rel="stylesheet" type="text/css" href="../css/docs.css"/>
  </head>
  <body style="padding: 20px;">
  	<p><?php echo $peal_version_string;?>: Forget Password</p>
	<form id="login" action="retrieve_password.php" method="post">
		Email Address: <input type="text" name="username" id="lemail" maxlength="40" />
		<input type="submit" value="Get New Password" onclick="checkEmail('lemail');" />
	</form>
	
	<a href="../index.php">Home</a>
	
  	<script language="javascript">
	function checkEmail(id) {
		var email = document.getElementById(id);
		var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (!filter.test(email.value)) {
			alert('Please provide a valid email address');
			return false;
		} else {
			return true;
		}
	}
	</script>	
  </body>
</html>