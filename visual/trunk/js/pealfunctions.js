/* Provides functionality for PEAL specific actions... */

// Adds the data for a newly entered variable to the list of variables
// Needs cleaning up

function addVariableToList() {
	var var1 = "", var2 = "", var3 = "", var4 = "";
	
	var elem = document.frmwizard.var1;
	if (elem.selectedIndex != -1) {
		var1 = elem.options[elem.selectedIndex].innerHTML;
	}
	elem = document.frmwizard.var2;
	if (elem.selectedIndex != -1) {
		var2 = elem.options[elem.selectedIndex].innerHTML;
	}
	elem = document.frmwizard.var3;
	if (elem.selectedIndex != -1) {
		var3 = elem.options[elem.selectedIndex].innerHTML;
	}
	elem = document.frmwizard.var4;
	if (elem.selectedIndex != -1) {
		var4 = elem.options[elem.selectedIndex].innerHTML;
	}
	var var5 = document.getElementById('var5').value;
	var init = document.getElementById('init').value;
	
	var result = "";

	// if var1 is empty then
	if (var1 == "") {
		alert("Please chose a selection from the first drop-down menu.");
	} else {
		// var2 can only be empty if there is a custom variable name and initialised value
		if (var2 == "") {
			if (var5 != "" && init != "") {
				//insert
				result = var1 + "." + var5 + " = " + init;
				var newopt = document.createElement("option");
				newopt.innerHTML = result;
				document.getElementById('varcode').appendChild(newopt);
				clearNewVar();

			} else {
				alert("Please chose a selection from the second drop-down menu\nOR\nEnter a custom variable name and an initialisation value.");
			}
		} else {
			// var3 can only be empty if there is a custom variable name and initialised value
			if (var3 == "") {
				if (var5 != "" && init != "") {
					//insert
					result = var1 + "." + var2 + "." + var5 + " = " + init;
					var newopt = document.createElement("option");
					newopt.innerHTML = result;
					document.getElementById('varcode').appendChild(newopt);
					clearNewVar();
				} else if (init != "") {
					//insert
					result = var1 + "." + var2 + " = " + init;
					var newopt = document.createElement("option");
					newopt.innerHTML = result;
					document.getElementById('varcode').appendChild(newopt);
					clearNewVar();
				} else {
					alert("Please chose a selection from the third drop-down menu\nOR\nEnter a custom variable name and an initialisation value.");
				}				
			} else {
				// var4 can only be empty if there is a custom variable name and initialised value
				if (var4 == "") {
					if (var5 != "" && init != "") {
						//insert
						result = var1 + "." + var2 + "." + var3 + "." + var5 + " = " + init;
						var newopt = document.createElement("option");
						newopt.innerHTML = result;
						document.getElementById('varcode').appendChild(newopt);
						clearNewVar();
					} else if (init != "") {
						//insert
						result = var1 + "." + var2 + "." + var3 + " = " + init;
						var newopt = document.createElement("option");
						newopt.innerHTML = result;
						document.getElementById('varcode').appendChild(newopt);
						clearNewVar();
					} else {
						alert("Please chose a selection from the fourth drop-down menu\nOR\nEnter a custom variable name and an initialisation value.");
					}				
				} else {
					if (var5 != "" && init != "") {
						//insert
						result = var1 + "." + var2 + "." + var3 + "." + var4 + "." + var5 + " = " + init;
						var newopt = document.createElement("option");
						newopt.innerHTML = result;
						document.getElementById('varcode').appendChild(newopt);
						clearNewVar();
					} else if (init != "") {
						//insert
						result = var1 + "." + var2 + "." + var3 + "." + var4 + " = " + init;
						var newopt = document.createElement("option");
						newopt.innerHTML = result;
						document.getElementById('varcode').appendChild(newopt);
						clearNewVar();
					} else {
						alert("Please enter an initialisation value.");
					}
				}				
			}
		}
	}
}

function removeVariableFromList() {
	// remove the option that's selected in the list of variables SELECT box
	var currentvars = document.frmwizard.varcode;
	var currentsel = currentvars.selectedIndex;
	if (currentsel != -1) {
		if (confirm("Are you sure you want to remove this variable?")) {
			var var1 = currentvars.options[currentsel];
			currentvars.removeChild(var1);
		}		
	}
}

// Places all the content from the Wizard window into the document
function okWizard() {
	var result = "";
	var cont = true;
	// check for empty form
	if (document.getElementById('description').value == "" && document.getElementById('varcode').innerHTML == "") {
		cont = confirm("This will create a blank new strategy.\n\nContinue?");
	} else if (!document.getElementById('varcode').hasChildNodes()) {
		cont = confirm("You have not provided any variables to initialise.\n\nContinue?");
	}
	if (cont) {
		var d = document.getElementById('description').value;
		d = "// DESCRIPTION\n// " + shortenCommentLineLength(d);
		result = result + d;
		
		//set up two arrays
		var conceptInit = new Array();
		var otherInit = new Array();
		//scan through the children of varcode, check for Concept
		var vc = document.getElementById('varcode');
		if (vc.hasChildNodes()) {
			while (vc.childNodes.length >= 1) {
				var txt = vc.firstChild.innerHTML;
				if (txt.indexOf("Concept") != -1) {
					// add to concept list
					conceptInit.push(txt);
				} else {
					// add to while true list
					otherInit.push(txt);
				}
				vc.removeChild(vc.firstChild);
			}
		}
		
		// create a one-line list of variables
		// two loops - one for concept vars and one for non-concept vars
		result = result + "\n//\n\n// VARS \n// ";
		for (var i=0; i<conceptInit.length; i++) {
			result = result + conceptInit[i].substring(0, conceptInit[i].indexOf(" =")) + ", ";
		}
		for (var i=0; i<otherInit.length; i++) {
			result = result + otherInit[i].substring(0, otherInit[i].indexOf(" =")) + ", ";
		}
		
		/*
		var v = document.getElementById('varcode').innerHTML;
		v = v.substr(0, v.length).substring(v.indexOf("<o"));					// In case there are new lines before the first <option> tag 
		*/
		//result = result + "\n//\n\n// VARS \n// " + removeInit(v.replace(/<option>/g, "").replace(/<\/option>/g, "").replace(/\n/g, ", "));
		
		result = result + "\n\ninitialization (\n";
		for (var i=0; i<otherInit.length; i++) {
			result = result + "\t" + otherInit[i] + "\n";
		}
		if (conceptInit.length > 0) {
			var nv = "\n";
			for (var i=0; i<conceptInit.length; i++) {
				nv = nv + "\t\t" + conceptInit[i] + "\n";
			}
			result = result + "\twhile true (" + nv + "\n\t)\n";
		}
		result = result + "\n)\n\nimplementation (\n\n)";
		
		editor.mirror.setCode(result);
		document.savedetails.stratname.value = "";
		document.getElementById("chkpublic").checked = false;
		document.getElementById("lockimg").src = "png/lock.png";
		document.getElementById("pubpriv").innerHTML = "Private";
		document.getElementById("isSaved").innerHTML = "";
		stopSave();
        
		fileName = "";

		hideWizard();
	}
}
function cancelWizard() {
	if (confirm("Are you sure you want to cancel the Wizard?")) {
		hideWizard();
	}
}
function cancelFileManager() {
	if (confirm("Are you sure you want to cancel the File Manager?")) {
		hideFileManager();
	}
}
// Moves the DIV for the Wizard off-screen
function hideWizard() {
	document.getElementById('wizard').style.left = -500 + "px";
	document.getElementById('wizard').style.top = 0 + "px";
	clearWizardForm();
}
// Moves the DIV for the File Manager off-screen
function hideFileManager() {
	document.getElementById('filemanager').style.left = -500 + "px";
	document.getElementById('filemanager').style.top = 0 + "px";
	clearFileManagerForm();
}
// Empties the boxes in the Wizard
function clearWizardForm() {
	document.getElementById('description').value = "";
	document.getElementById('varcode').innerHTML = "";
	clearNewVar();
}
function clearFileManagerForm() {
	// remove all options
	//document.getElementById("publicfiles").innerHTML = "";	
	var a = document.getElementById('publicfiles');
	removeAllChildren(a);
	
	// remove all options
	a = document.getElementById('privatefiles');
	removeAllChildren(a);
	
	document.frmfiles.pstrat.value = "";
	document.frmfiles.sname.value = "";
}
// Empties the variable boxes in the Wizard
function clearNewVar() {
	document.getElementById('var1').value = "";
	document.getElementById('var2').value = "";
	document.getElementById('var3').value = "";
	document.getElementById('var4').value = "";
	document.getElementById('var5').value = "";
	document.getElementById('init').value = "";
	// create new set of dropdowns
	newMenu(0);
}

// Moves the DIV for the Wizard on-screen
function showWizard() {
	document.getElementById('wizard').style.left = (document.body.clientWidth/2 - 300) + "px";
	document.getElementById('wizard').style.top = 60 + "px";
	document.getElementById('description').value = "";

	var varcode = document.getElementById('varcode');
	removeAllChildren(varcode);
}
// Moves the DIV for the File Manager on-screen
function showFileManager() {
	document.getElementById("filemanager").style.left = (document.body.clientWidth/2 - 300) + "px";
	document.getElementById("filemanager").style.top = 60 + "px";
	// need an ajax function which updates the two columns...
	removeAllChildren(document.getElementById("publicfiles"));
	removeAllChildren(document.getElementById("privatefiles"));
	var loading = document.createElement("option"), loading2 = document.createElement("option");
	loading.innerHTML = loading2.innerHTML = "Loading strategies...";
	document.getElementById("publicfiles").appendChild(loading);
	document.getElementById("privatefiles").appendChild(loading2);
	getStrategyLists();
}

function selectedStrategy(p) {
	var pfiles;
	if (p == "true") {
		// Public files
		pfiles = document.getElementById("publicfiles");
		document.getElementById("privatefiles").selectedIndex = -1;
	} else if (p == "false") {
		// Private files
		pfiles = document.getElementById("privatefiles");
		document.getElementById("publicfiles").selectedIndex = -1;
	}
	var psel = pfiles.selectedIndex;
	if (psel != -1) {
		var fname = pfiles.options[psel].value + ".xml";
		if (fname != "No strategies available.xml") {
			document.getElementById('sname').value = fname;
			document.getElementById('pstrat').value = p;
		} else {
			document.getElementById('sname').value = "";
			document.getElementById('pstrat').value = "";
		}
	}
}

// Shortens comment lines to 72 characters by finding the last space before the 72nd character and
// chopping the string there, putting the rest on the following line.
function shortenCommentLineLength(s) {
	if (s.length > 72) {
		var restrictLengthTo = findMostRecentSpace(s.substr(0, 72));
		return s.substr(0, restrictLengthTo).replace(/\n/g, "\n// ") + "\n// " + shortenCommentLineLength(s.substr(restrictLengthTo));
	} else {
		return s.replace(/\n/g, "\n// ");
	}
}

// Reverses the string, uses indexOf to find a space and then returns (72-that number)
function findMostRecentSpace(s) {
	var backwards = reverseStr(s);
	var subtract = backwards.indexOf(" ");
	if (subtract != -1) {
		return (72 - subtract);
	} else {
		return 72;
	}
}

// Reverses a string
// NOT my code
function reverseStr(s) {
  var inp = s;
  var outp = 0;
  for (i = 0; i <= s.length; i++) {
    outp = inp.charAt(i) + outp;
  }
  return outp;
} 

// Removes all children from an element
function removeAllChildren(elem) {
	if (elem && elem.hasChildNodes()) {
		while (elem.childNodes.length >= 1) {
			elem.removeChild(elem.firstChild);
		}
	}
}

// Removes the initialisation from a string;
function removeInit(s) {
	var result = "";
	var split = s.split(", ");	
	for (var i=0; i<split.length; i++) {
		var o = split[i];
		var pos = o.indexOf(" =");
		if (pos != -1) {
			result = result + o.substr(0, pos) + ", ";
		} else {
			result = result + o + ", ";
		}
	}
	return result.substr(0, result.length-2);
}

//Creates new menus from the options specified in the config file
function createMenus() {
	newMenu(0);
}
// Creates new OPTION tags for each of the values in the array and appends them to the SELECT element supplied
//
// Still need to implement code which disables some drop downs/textbox if there are no options, and
// disables just the drop downs if the option is "", but enables the textbox...
function newMenu(elem) {
	var lists = ["var1", "var2", "var3", "var4"];

	// if elem is in the range 0 - 3
	if(elem <= lists.length-1 && elem >= 0) {
		// for elem to 3 remove all current list options
		for (var i=elem; i<lists.length; i++) {
			var e = document.getElementById(lists[i]);
			removeAllChildren(e);
			// add a blank option
			var n = document.createElement("option");
			n.innerHTML = "";
			e.appendChild(n);
		}
	}
	
	var selected = new Array();
	for (var i=0; i<lists.length; i++) {
		selected[i] = document.getElementById(lists[i]).selectedIndex;
	}
	
	// first drop-down
	if (elem == 0) {
		var e = document.getElementById(lists[elem]);
		for (var j=0; j<wizardMenu[0].length; j++) {
			var iopt = document.createElement("option");
			iopt.innerHTML = wizardMenu[j][0];
			e.appendChild(iopt);
		}
	}
	// second drop-down
	if (elem <= 1) {
		var e = document.getElementById(lists[elem]);
		var s1 = selected[0];
		if (s1 != 0) {
			for (var j=0; j<wizardMenu[s1-1][1].length; j++) {
				var iopt = document.createElement("option");
				iopt.innerHTML = wizardMenu[s1-1][1][j];
				e.appendChild(iopt);
			}
		}
	}
	// third drop down
	if (elem <= 2) {
		var e = document.getElementById(lists[elem]);
		var s1 = selected[0], s2 = selected[1];
		if (s1 != 0 && s2 != 0) {
			for (var j=0; j<wizardMenu[s1-1][2][s2-1].length; j++) {
				var iopt = document.createElement("option");
				iopt.innerHTML = wizardMenu[s1-1][2][s2-1][j];
				e.appendChild(iopt);
			}
		}
	}
	// fourth drop down
	if (elem <= 3) {
		var e = document.getElementById(lists[elem]);
		var s1 = selected[0], s2 = selected[1], s3 = selected[2];
		if (s1 != 0 && s2 != 0 && s3 != 0) {
			for (var j=0; j<wizardMenu[s1-1][3][s2-1][s3-1].length; j++) {
				var iopt = document.createElement("option");
				iopt.innerHTML = wizardMenu[s1-1][3][s2-1][s3-1][j];
				e.appendChild(iopt);
			}
		}
	}
}

function newStrategy() {
	var checkAction = confirm("Are you sure you want to start a new blank strategy?\n\nYou will loose all currently unsaved changes.");
	if (checkAction) {
		var blank = "// DESCRIPTION\n//\n//\n\n// VARS\n//\n//\n\ninitialization (\n\n)\n\nimplementation (\n\n)";
		editor.mirror.setCode(blank);
		stopSave();
		fileName = "";
		document.getElementById("stratname").value = "";
		document.getElementById("chkpublic").checked = false;
		document.getElementById("lockimg").src = "png/lock.png";
		document.getElementById("pubpriv").innerHTML = "Private";
		document.getElementById("isSaved").innerHTML = "";
	} else {
		return;
	}
}

function insertAutoComplete() {
	var m = this.editor.mirror;
	var e = parent.document.getElementById("autowords");
	if (e.selectedIndex != -1) {
		var ln = m.cursorPosition().line;
		var cp = m.cursorPosition().character;
		var txt = e.options[e.selectedIndex].innerHTML;
		var existing = m.editor.curWord;
		removeAllChildren(e);
		
		// Can't use clearDebugDisplay(); since it is called from inside the Iframe and requires parent, whereas
		// we don't want parent from here...
		this.document.getElementById("cc").innerHTML = "&nbsp;";
		
		// replace current SPAN with new text
		editor.mirror.replaceSelection(txt.substring(existing.length));
		
		// assign a selection of just after the token
		var strt = end = m.win.select.cursorPos(m.editor.container, false);
		
		// set the cursor to be after the token
		m.win.select.setCursorPos(m.editor.container, strt, end);
	}
}

function publicCheckBox(chkbox) {
	if (!chkbox) {
		document.getElementById('chkpublic').checked = !document.getElementById('chkpublic').checked;
		// should there be an alert warning the user of duped files?
	}

	if (document.getElementById('chkpublic').checked) {
		document.getElementById("lockimg").src = "png/lock_open.png";
		document.getElementById("pubpriv").innerHTML = "Public";
	} else {
		document.getElementById("lockimg").src = "png/lock.png";
		document.getElementById("pubpriv").innerHTML = "Private";
	}
}

/*
 * The following code provides some interaction with the parser letting the user know what is current required next in the
 * strategy and what is on the parser stack...
 */
function debugDisplay(msg) {
	var dd = parent.document.getElementById("cc");
	if (dd.innerHTML == "&nbsp;") {
	  dd.innerHTML = msg;
	} // else you dont get the first error
}
function clearDebugDisplay() {
	parent.document.getElementById("cc").innerHTML = "&nbsp;";
}

function updatePreview() {
	var fElem = document.getElementById('fragmentList');
	
	var selIndex = fElem.selectedIndex;
	if (selIndex != -1) {
		document.getElementById("fragmentViewer").innerHTML = fElem.options[selIndex].value;
	}
}
