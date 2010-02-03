LAGVE = new Object();
LAGVE.scriptName = 'visual_editor.js';

getMyY().use("node-menunav",'console', function(Y) {
	//new Y.Console().render();

	LAGVE._init = function() {		
		LAGVE._findMainMenu();
		LAGVE._findAttrMenu();
		LAGVE._findWorkspace();
		
		LAGVE._setupMainMenu();
		LAGVE._setupWorkspace();
		
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
	}
	
	LAGVE._setupWorkspace = function() {
		var workspaceDT = new Y.DD.Drop({ node: LAGVE.workspace });
		
		//create initialization
			
		var initialization = LAGVE._createInitialization();
		LAGVE.select(initialization);
		LAGVE.workspace.append(initialization);
		
		//create implementation
		LAGVE.workspace.append(LAGVE._createImplementation());
	}
	
	LAGVE._createInitialization = function() {
		LAGVE.initialization	= Y.Node.create( '<div id="initialization" class="selectable"></div>' );
		var title = Y.Node.create( '<div id="initialization-title">INITIALIZATION</div>' );
		
		statementBox = LAGVEStmt.newStatement();
		statementBox.removeClass('deletable');
		statementBox.setStyle('minWidth','400px');
		statementBox.setStyle('minHeight','150px');
		
		LAGVE.initialization.append(title);
		LAGVE.initialization.append(statementBox);
		
		
		return LAGVE.initialization;
	}
	
	LAGVE._createImplementation = function() {
		LAGVE.implementation	= Y.Node.create( '<div id="implementation" class="selectable"></div>' );
		var title = Y.Node.create( '<div id="implementation-title">IMPLEMENTATION</div>' );
		
		statementBox = LAGVEStmt.newStatement();
		statementBox.removeClass('deletable');
		statementBox.setStyle('minWidth','400px');
		statementBox.setStyle('minHeight','150px');
		
		LAGVE.implementation.append(title);
		LAGVE.implementation.append(statementBox);
		
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
	}
	
	LAGVE.select = function (selectedNode) {
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
		}
	}
	
	Y.on("contentready", LAGVE._init, "body");
	
	Y.on('click',function(e){LAGVE.select(e.target)});
});

LAGVE.showHelp = function() {document.getElementById('VE-help').style.visibility = 'visible';}

LAGVE.hideHelp = function() {document.getElementById('VE-help').style.visibility = 'hidden';}