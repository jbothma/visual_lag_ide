LAGVE = new Object();
LAGVE.scriptName = 'visual_editor.js';
LAGVE.dropStack = new Array;

getMyY().use('node-menunav','console', 'io', 'dd-ddm-drop', function(Y) {
	//new Y.Console().render();

	LAGVE._init = function() {		
		LAGVE._findMainMenu();
		LAGVE._findAttrMenu();
		LAGVE._findWorkspace();
		
		LAGVE._setupMainMenu();
		LAGVE._setupWorkspace();
		LAGVE.getHelp();
		
		LAGVE._editorReady();		
	}	
	
	LAGVE._editorReady = function() {
		Y.one('#VE-loading-msg').setStyle('visibility','hidden');
		Y.one('#VE-window').setStyle('visibility','');
	}
	
	LAGVE._findAttrMenu = function() {
		LAGVE.attrMenu = Y.one("#LAG-Attr-Menu");
	}
	
	LAGVE._findMainMenu = function() {
		 LAGVE.mainMenu = Y.one("#VE-menu");
	}
	
	LAGVE._findWorkspace = function() {
		LAGVE.workspace = Y.one('#VE-workspace');
	}
	
	LAGVE._setupMainMenu = function() {
		LAGVE.mainMenu.plug(
			Y.Plugin.NodeMenuNav, 
			{	autoSubmenuDisplay:	false,
				mouseOutHideDelay:	999999,
				submenuShowDelay:	0,
				submenuHideDelay:	999999
			});
			
		LAGVE.mainMenu.attrMenuLabel = Y.one('#LAG-Attr-menulabel');
	}
	
	LAGVE._setupWorkspace = function() {
		var workspaceDT = new Y.DD.Drop({ node: LAGVE.workspace });
		
		//create initialization
			
		var initialization = LAGVE._createInitialization();
		LAGVE.select(initialization);
		LAGVE.workspace.append(initialization);
		
		//create implementation
		LAGVE.workspace.append(LAGVE._createImplementation());
		
		Y.DD.DDM.set('dragMode','point');
	}
	
	LAGVE._createInitialization = function() {
		LAGVE.initialization	= Y.Node.create( '<div id="initialization" class="selectable"></div>' );
		var title = Y.Node.create( '<div id="initialization-title">INITIALIZATION</div>' );
		
		var statementBox = LAGVEStmt.newStatement();
		statementBox.removeClass('deletable');
		// It'd be ambiguious if Initialization statement
		// block could be selected because it's prettier
		// if Init is selectable and Init's selectedness
		// is passed through to the statement block anyway.
		statementBox.removeClass('selectable');
		statementBox.setStyle('minWidth','400px');
		statementBox.setStyle('minHeight','150px');
		
		LAGVE.initialization.append(title);
		LAGVE.initialization.append(statementBox);
		
		/**
		 *	Pass Initialization's LAGVEInsert to statementBox's
		 */
		LAGVE.initialization.LAGVEInsert = function(node) {
			statementBox.LAGVEInsert(node);
		}
		
		return LAGVE.initialization;
	}
	
	LAGVE._createImplementation = function() {
		LAGVE.implementation	= Y.Node.create( '<div id="implementation" class="selectable"></div>' );
		var title = Y.Node.create( '<div id="implementation-title">IMPLEMENTATION</div>' );
		
		var statementBox = LAGVEStmt.newStatement();
		statementBox.removeClass('deletable');
		// It'd be ambiguious if implementation statement
		// block could be selected because it's prettier
		// if Init is selectable and Init's selectedness
		// is passed through to the statement block anyway.
		statementBox.removeClass('selectable');
		statementBox.setStyle('minWidth','400px');
		statementBox.setStyle('minHeight','150px');
		
		LAGVE.implementation.append(title);
		LAGVE.implementation.append(statementBox);
		
		/**
		 *	Pass Initialization's LAGVEInsert to statementBox's
		 */
		LAGVE.implementation.LAGVEInsert = function(node) {
			statementBox.LAGVEInsert(node);
		}
		
		return LAGVE.implementation;
	}
	/**
	*	LAGVE.insertNewAttr
	*	
	*	Insert attribute and hide menu automatically
	*/
	LAGVE.insertNewAttr = function(attributeLevelsArr, targetId) {
		LAGVEAttr.insertNewAttr(attributeLevelsArr, targetId);
		LAGVE.attrMenu.addClass('yui-menu-hidden');
		LAGVE.mainMenu.attrMenuLabel.removeClass('yui-menu-label-menuvisible');
	}
	
	LAGVE.select = function (selectedNode) {
		if (isset(selectedNode)) {
			// if the thing I clicked on is something I can select
			if (selectedNode.hasClass('selectable')) {
				if (isset(LAGVE.selectedNode)) {
					//remove clas from previously selected item
					LAGVE.selectedNode.removeClass('selected');
				}
				// set LAGVE.seletedNode to the thing I selected
				LAGVE.selectedNode = selectedNode;
				// give it the selected class which makes it obvious it's selected
				LAGVE.selectedNode.addClass('selected');
			} else {
				// limit/safety stop case
				if (selectedNode.hasClass('select-propagation-stop') || selectedNode.get('tagName') === 'body') {
					return
				} else {
					LAGVE.select(selectedNode.get('parentNode'));
				}
			}
		}
	}
	
	LAGVE.getHelp = function() {
		var uri = 'help.htm';
	 
		// Make an HTTP request to 'get.php'.
		// NOTE: This transaction does not use a configuration object.
		var request = Y.io(uri);
	}
	
	// Define a function to handle the response data.
	LAGVE.getHelpComplete = function(id, o, args) {
		var id = id; // Transaction ID.
		var data = o.responseText;
		Y.one('#VE-help-container').append(Y.Node.create(data));
	};
	
	// Subscribe to event "io:complete", and pass an array
    // as an argument to the event handler "complete", since
    // "complete" is global.   At this point in the transaction
    // lifecycle, success or failure is not yet known.
    Y.on('io:complete', LAGVE.getHelpComplete);
	
	Y.on('contentready', LAGVE._init, 'body');
	
	Y.on('click', function(e){LAGVE.select(e.target)});
	
	Y.DD.DDM.on('drop:enter', function(e) {
		LAGVE.dropStack.push(e.drop.get('node'));
	});
	
	Y.DD.DDM.on('drop:exit', function(e) {
		LAGVE.dropStack.pop();
	});
	
	Y.DD.DDM.on('drag:end', function(e) {
		LAGVE.dropStack = new Array;
	});
	
	Y.DD.DDM.on('drag:start', function(e) {
		LAGVE.dropStack = new Array;
	});
});

LAGVE.showHelp = function() {document.getElementById('VE-help').style.visibility = 'visible';}

LAGVE.hideHelp = function() {document.getElementById('VE-help').style.visibility = 'hidden';}