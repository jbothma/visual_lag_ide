/** Basic set up for an AJAX call **/
// Creates an XmlHttpObject
function GetXmlHttpObject()	{
	var xmlHttp;
	try {
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try {
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	return xmlHttp;
}

var fileName;			// saveFile should just check the hidden form field on the webpage for the filename...
var isPublic;
var delFile;
function saveFile() {
	// check for content...
	if (editor.mirror.getCode() != "") {
		xmlHttp=GetXmlHttpObject();
		if(xmlHttp==null) {
			alert ("Your browser does not support AJAX!");
			return;
		}
		var now = new Date();
		var url = "php/save_file.php";
		url = url + "?time=" + now + "&sid=" + Math.random();
		var params = "filename=" + fileName + "&ispublic=" + isPublic + "&code=" + editor.mirror.getCode(); //get code from editor
		if (delFile) {
			params = params + "&delete=" + delFile;
			delFile = null;
		}
		xmlHttp.onreadystatechange=fileSaved;
		try {
			xmlHttp.open("POST", url, true);			
			xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlHttp.setRequestHeader("Content-length", params.length);
			xmlHttp.setRequestHeader("Connection", "close");
			xmlHttp.send(params);
			document.getElementById("isSaved").innerHTML = "<span style=\"color: orange;\">Saving file...</span>";
		} catch (e) {
			//alert('Could not open xmlHttp or sendRequestHeaders or parameters');
			document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open xmlHttp or setRequestHeader or send parameters...</span>";
			setTimeout("clearResponse()", 5000);
		}
	}
}

var t;
function timedSave() {
	isPublic = false;
	if (document.savedetails.chkpublic.checked) {
		isPublic = true;
	}
	// saveFile should be made private... as in, subset of timedSave...?
	saveFile();
	t = setTimeout("timedSave()", 30*1000);
}
// Stop the autosaving
function stopSave() {
	if (t) {
		clearTimeout(t);
	}
}
// Clear the tag containing response from server about saving files etc
function clearResponse() {
	document.getElementById("isSaved").innerHTML = "";
}

var downloadFile = false;
function fileSaved() {
	if (xmlHttp.readyState == 4) {
		if (xmlHttp.responseText == "Timeout") {
			window.location = "index.php?timeout";
			return;
		}

		document.getElementById("isSaved").innerHTML = xmlHttp.responseText;
		setTimeout("clearResponse()", 5000);
		if (downloadFile) {
			window.location = "php/download_strategy.php?filename=" + document.getElementById('stratname').value + "&ispublic=" + isPublic;
			downloadFile = false;
			document.getElementById('stratname').value = "";
		}
	}
}

// Asks for prompt, then saves the strategy under that new name, deleting the temp file from users folder
function saveStrategy(saveas) {
	// TODO - is there a way of deleting temporary strategies?!

	var fn;
	// if there is already a file opened, save that
	if (document.getElementById('stratname').value != "" && saveas != "copy") {
		fn = document.getElementById('stratname').value;
	// if it is a new file, ask for a name (remember that onload initSave DOESNT happen)
	} else {
		fn = prompt("Please enter a file name:\n\nNon-alphanumeric characters will be replaced with underscores.", "");
		if (fn == null) { return; }
		fn = fn.replace(/\b[\W]+\b/g, "_");		// replace non alphanumerics with _
		document.getElementById('stratname').value = fn + ".xml";
		fn = fn + ".xml";
	}
	
	fileName = fn;
	isPublic = false;
	if (document.savedetails.chkpublic.checked) {
		isPublic = true;
	}
	//saveFile();
	timedSave();
}

var openStratPublic;
var openStratFilename;
function openStrategy() {
	/*
	on select (of either public/private) update hidden fields containing the two variables: public & filename
	on select (of either public/private) clear the selection in the opposite column
	on openstrategy pass the two variables
	*/
	
	openStratPublic = document.getElementById("pstrat").value;
	openStratFilename = document.getElementById("sname").value;
	
	if (openStratPublic != "" && openStratFilename != "") {
		xmlHttp2=GetXmlHttpObject();
		if(xmlHttp2==null) {
			alert ("Your browser does not support AJAX!");
			return;
		}

		var url = "php/get_strategy.php";
		url = url + "?sid=" + Math.random();
		var params = "filename=" + openStratFilename + "&ispublic=" + openStratPublic;		//filename and public flag for strategy to open

		xmlHttp2.onreadystatechange=fileReceived;

		try {
			xmlHttp2.open("POST", url, true);
			
			xmlHttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlHttp2.setRequestHeader("Content-length", params.length);
			xmlHttp2.setRequestHeader("Connection", "close");

			xmlHttp2.send(params);
			document.getElementById("isSaved").innerHTML = "<span style=\"color: orange;\">Requesting file...</span>";
		} catch (e) {
			//alert('Could not open xmlHttp or sendRequestHeaders or parameters');
			document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open xmlHttp or setRequestHeader or send parameters to open strategy!</span>";
			setTimeout("clearResponse()", 5000);
		}
		hideFileManager();
	} else {
		alert('Please select a valid option from the drop-down list.');
	}
}

// Requests confirmation for opening the strategy, then inserts the code to the editor
function fileReceived() {
	if (xmlHttp2.readyState == 4) {
		if (xmlHttp2.responseText == "Timeout") {
			window.location = "index.php?timeout";
			return;
		}

		if (xmlHttp2.responseText != "Cancel") {
			if (confirm("Are you sure you want to open this strategy?\n\nYou will loose all current unsaved changes to the current strategy.")) {
				if (openStratPublic == "true") {
					document.getElementById("chkpublic").checked = true;
					document.getElementById("lockimg").src = "png/lock_open.png";
					document.getElementById("pubpriv").innerHTML = "Public";
				} else {
					// if it isn't public, then start the autosaver
					timedSave();
					document.getElementById("lockimg").src = "png/lock.png";
					document.getElementById("pubpriv").innerHTML = "Private";
				}
				document.getElementById("stratname").value = openStratFilename;
				fileName = openStratFilename;
				editor.mirror.setCode(xmlHttp2.responseText);
				document.getElementById("isSaved").innerHTML = "";
			}
		} else {
			document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open that strategy!</span>";
			setTimeout("clearResponse()", 5000);
		}
	}
}

// For when the lists of strategies are received
function strategiesReceivedPublic() {
	if (xmlHttp3.readyState == 4) {
		if (xmlHttp3.responseText == "Timeout") {
			window.location = "index.php?timeout";
			return;
		}
		
		receivedStrategies(document.getElementById("publicfiles"), xmlHttp3.responseText);
	}
}
function strategiesReceivedPrivate() {
	if (xmlHttp4.readyState == 4) {
		if (xmlHttp4.responseText == "Timeout") {
			window.location = "index.php?timeout";
			return;
		}

		receivedStrategies(document.getElementById("privatefiles"), xmlHttp4.responseText);
	}
}

function receivedStrategies(elem, response) {
	if (response != "") {
		var files = response.split(",");
		removeAllChildren(elem);
		for (var i=0; i<files.length-1; i++) {			//length-1 because the end of the string will have a ,
			var item = document.createElement("option");
			item.innerHTML = files[i];
			elem.appendChild(item);
		}
	} else {
		removeAllChildren(elem);
		var none = document.createElement("option");
		none.innerHTML = "No strategies available";
		elem.appendChild(none);
	}
	document.getElementById("isSaved").innerHTML = "";
}
// These are global because the fileDeleted function needs access to them.
// Really should namespace my code...
var delStratPublic;
var delStratFilename;
function deleteStrategy() {
	// uses the hidden fields to gain the data required to know what to delete
	// needs to call the update columns function once a response has been received
	delStratPublic = document.frmfiles.pstrat.value; //document.savedetails.openstrat.options[document.savedetails.openstrat.selectedIndex].value;
	delStratFilename = document.frmfiles.sname.value; //document.savedetails.openstrat.options[document.savedetails.openstrat.selectedIndex].innerHTML;
	
	if (!confirm("Are you sure you want to delete this file:\n\n" + delStratFilename)) {
		return;
	}
	
	if (delStratPublic != "" && delStratFilename != "") {
		xmlHttp5=GetXmlHttpObject();
		if(xmlHttp5==null) {
			alert ("Your browser does not support AJAX!");
			return;
		}

		var url = "php/delete_strategy.php";
		url = url + "?sid=" + Math.random() + "&filename=" + delStratFilename + "&ispublic=" + delStratPublic;		//filename and public flag for strategy to open

		xmlHttp5.onreadystatechange=fileDeleted;

		try {
			xmlHttp5.open("GET", url, true);
			xmlHttp5.send(null);
			document.getElementById("isSaved").innerHTML = "<span style=\"color: orange;\">Deleting file...</span>";
		} catch (e) {
			//alert('Could not open xmlHttp or sendRequestHeaders or parameters');
			document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open xmlHttp or setRequestHeader or send parameters to open strategy!</span>";
			setTimeout("clearResponse()", 5000);
		}
	} else {
		alert('Please select a valid option from the drop-down list.');
	}
	//getStrategyLists();
}
function fileDeleted() {
	if (xmlHttp5.readyState == 4) {
		if (xmlHttp5.responseText == "Timeout") {
			window.location = "index.php?timeout";
			return;
		}

		if (xmlHttp5.responseText == "true") {
			//document.frmfiles.privatefiles.innerHTML = xmlHttp4.responseText;				
			getStrategyLists();
			document.getElementById("isSaved").innerHTML = "";
		} else if (xmlHttp5.responseText == "false") {
			alert("Couldn't delete that strategy. Check ownership permissions.");
		}
	}	
}


function getStrategyLists() {
	// requests twice, once for public
	xmlHttp3=GetXmlHttpObject();
	if(xmlHttp3==null) {
		alert ("Your browser does not support AJAX!");
		return;
	}

	var url = "php/get_strategy_list.php";
	url = url + "?sid=" + Math.random();
	url = url + "&public=true";

	xmlHttp3.onreadystatechange = strategiesReceivedPublic;

	try {
		xmlHttp3.open("GET", url, true);
		xmlHttp3.send(null);
		document.getElementById("isSaved").innerHTML = "<span style=\"color: orange;\">Requesting strategies...</span>";
	} catch (e) {
		//alert('Could not open xmlHttp or sendRequestHeaders or parameters');
		document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open xmlHttp or setRequestHeader or send parameters to open strategy!</span>";
		setTimeout("clearResponse()", 5000);
	}

	// ...once for private
	
	xmlHttp4=GetXmlHttpObject();
	if(xmlHttp4==null) {
		alert ("Your browser does not support AJAX!");
		return;
	}

	url = "php/get_strategy_list.php";
	url = url + "?sid=" + Math.random();
	url = url + "&public=false";

	xmlHttp4.onreadystatechange = strategiesReceivedPrivate;

	try {
		xmlHttp4.open("GET", url, true);
		xmlHttp4.send(null);
	} catch (e) {
		//alert('Could not open xmlHttp or sendRequestHeaders or parameters');
		document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open xmlHttp or setRequestHeader or send parameters to open strategy!</span>";
		setTimeout("clearResponse()", 5000);
	}
}

function downloadStrategy() {
	// This variable is used for saving the file above...
	isPublic = "false";
	if (document.getElementById('chkpublic').checked) {
		isPublic = "true";
	}
	// If there is no file name...
	if (document.getElementById('stratname').value == "") {
		var now = new Date();
		var year = now.getFullYear();
		var month = now.getMonth();
		var day = now.getDate();
		var hours = now.getHours();
		var minutes = now.getMinutes();
		var seconds = now.getSeconds();
		
		fileName = "temp" + Date.UTC(year,month,day,hours,minutes,seconds) + ".xml";
		document.getElementById('stratname').value = fileName;
		downloadFile = true;
		saveFile();
	} else {
		window.location = "php/download_strategy.php?filename=" + document.getElementById('stratname').value + "&ispublic=" + isPublic;
	}
}

/** Saving and loading code fragments **/

function saveFragment() {
	// check for content...
	if (editor.mirror.editor.selectedText() != "") {
		var fragFileName = prompt("Please enter an alphanumeric name for this code fragment:");
		fragFileName = fragFileName.replace(/\b[\W]+\b/g, "_");		// replace non alphanumerics with _
		if (fragFileName != null && fragFileName != "") {
			xmlHttp6=GetXmlHttpObject();
			if(xmlHttp6==null) {
				alert ("Your browser does not support AJAX!");
				return;
			}
			var now = new Date();
			var url = "php/save_fragment.php";
			url = url + "?time=" + now + "&sid=" + Math.random();
			var params = "filename=" + fragFileName + ".frag&code=" + editor.mirror.editor.selectedText(); 	//get selected code from editor
			xmlHttp6.onreadystatechange=fragSaved;
			try {
				xmlHttp6.open("POST", url, true);
				xmlHttp6.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xmlHttp6.setRequestHeader("Content-length", params.length);
				xmlHttp6.setRequestHeader("Connection", "close");
				xmlHttp6.send(params);
				document.getElementById("isSaved").innerHTML = "<span style=\"color: orange;\">Saving code fragment...</span>";
			} catch (e) {
				document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open xmlHttp or setRequestHeader or send parameters...</span>";
				setTimeout("clearResponse()", 5000);
			}
		}
	} else {
		alert("Nothing is selected. Please select some code and try again.");
		return;
	}
}
// Response once fragsaved has responded
function fragSaved() {
	if (xmlHttp6.readyState == 4) {
		if (xmlHttp6.responseText == "Timeout") {
			window.location = "index.php?timeout";
			return;
		}

		document.getElementById("isSaved").innerHTML = xmlHttp6.responseText;
		getFragments();
		setTimeout("clearResponse()", 5000);
	}
}

function openFragment() {

	//need to check for selected item in the fragment list
	//
	//
	var fragName = "";
	var fe = document.getElementById("fragmentList");
	var sel = fe.selectedIndex;
	if (sel != -1) {
		fragName = fe.options[sel].innerHTML;		// because 'value' contains a snippet of the code...
	}
	
	if (fragName != "") {
		xmlHttp7=GetXmlHttpObject();
		if(xmlHttp7==null) {
			alert ("Your browser does not support AJAX!");
			return;
		}

		var url = "php/get_fragment.php";
		url = url + "?sid=" + Math.random();
		var params = "filename=" + fragName + ".frag";		//filename

		xmlHttp7.onreadystatechange=fragReceived;

		try {
			xmlHttp7.open("POST", url, true);
			
			xmlHttp7.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlHttp7.setRequestHeader("Content-length", params.length);
			xmlHttp7.setRequestHeader("Connection", "close");

			xmlHttp7.send(params);
			document.getElementById("isSaved").innerHTML = "<span style=\"color: orange;\">Requesting code fragment...</span>";
		} catch (e) {
			document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open xmlHttp or setRequestHeader or send parameters to open strategy!</span>";
			setTimeout("clearResponse()", 5000);
		}
	} else {
		alert('Please select a valid option from the drop-down list.');
	}
}

// on retreival of the code fragment
function fragReceived() {
	if (xmlHttp7.readyState == 4) {
		if (xmlHttp7.responseText == "Timeout") {
			window.location = "index.php?timeout";
			return;
		}
		if (xmlHttp7.responseText != "Cancel") {
			var m = editor.mirror;
			var ln = m.cursorPosition().line;
			var cp = m.cursorPosition().character;
			if (ln) {
				if (confirm("Are you sure you want to insert this fragment?")) {
					// insert code after the cursor
					editor.mirror.insertIntoLine(ln, cp, xmlHttp7.responseText);
					// assign a selection of just after the token
					var strt = end = m.win.select.cursorPos(m.editor.container, false);
					// set the cursor to be after the token
					m.win.select.setCursorPos(m.editor.container, strt, end);
					document.getElementById("isSaved").innerHTML = "";
				}
			} else {
				alert("Please place your cursor in the editor before clicking 'Insert Code'.");
			}
		} else {
			document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open/insert that code fragment!</span>";
			setTimeout("clearResponse()", 5000);
		}
	}
}

function getFragments() {
	// requests twice, once for public
	xmlHttp8=GetXmlHttpObject();
	if(xmlHttp8==null) {
		alert ("Your browser does not support AJAX!");
		return;
	}

	var url = "php/get_fragment_list.php";
	url = url + "?sid=" + Math.random();

	xmlHttp8.onreadystatechange = fragmentsReceived;

	try {
		xmlHttp8.open("GET", url, true);
		xmlHttp8.send(null);
		document.getElementById("isSaved").innerHTML = "<span style=\"color: orange;\">Requesting code fragments...</span>";
	} catch (e) {
		document.getElementById("isSaved").innerHTML = "<span style=\"color: red;\">Could not open xmlHttp or setRequestHeader or send parameters to open strategy!</span>";
		setTimeout("clearResponse()", 5000);
	}
}

function fragmentsReceived() {
	if (xmlHttp8.readyState == 4) {
		if (xmlHttp8.responseText == "Timeout") {
			window.location = "index.php?timeout";
			return;
		}

		var response = xmlHttp8.responseText;
		var elem = document.getElementById("fragmentList");

		if (response != "") {			
			var files = response.split("@");
			removeAllChildren(elem);
			for (var i=0; i<files.length-1; i++) {			//length-1 because the end of the string will have a ,
				var item = document.createElement("option");
				var inner = files[i].substring(0, files[i].indexOf(":"));
				var value = files[i].substring(files[i].indexOf(":")+1);
				item.innerHTML = inner;
				item.value = value.replace(/\n/g, "<br/>") + "...";
				elem.appendChild(item);
				document.getElementById("isSaved").innerHTML = "";
			}
		} else {
			removeAllChildren(elem);
			var none = document.createElement("option");
			none.innerHTML = "No fragments available";
			elem.appendChild(none);
			document.getElementById("isSaved").innerHTML = "";
		}
	}
}
