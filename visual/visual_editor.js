LAGVE = new Object();
LAGVE.scriptName = 'visual_editor.js';

getMyY().use("node-menunav",'console', function(Y) {
	new Y.Console().render();
	
	var menu = Y.one("#VE-menu");
	menu.plug(	Y.Plugin.NodeMenuNav, 
				{	autoSubmenuDisplay:	false,
					mouseOutHideDelay:	999999,
					submenuShowDelay:	0,
					submenuHideDelay:	999999});
	
	var workspace = Y.one('#VE-workspace');
	var workspaceDT = new Y.DD.Drop({ node: workspace });
	workspaceDT.node = workspace;
	
	var attrMenu = Y.one("#LAG-Attr-Menu");
	LAGVE.insertNewAttr = function(attributeLevelsArr, targetId) {
		LAGVEAttr.insertNewAttr(attributeLevelsArr, targetId);
		attrMenu.addClass('yui-menu-hidden');
	}

	var isWorkspace = function(node) {
		return node.get('id') === 'VE-workspace';
	}
	
	/**
	 *	LAGVE.deleteItem
	 *
	 *	Recursively search ancestors of given node until:
	 *	- node with class 'deletable' is found and removed
	 *	- workspace node is found
	 *	- body tag is found
	 */
	LAGVE.deleteItem = function(node) {
		if (isWorkspace(node) || node.get('tagName') === 'body') {
			return
		}
		
		if (node.hasClass('deletable')) {
			if (confirm("Are you sure you want to delete this item?")) {
				node.remove();
				return;
			}
		} else {
			LAGVE.deleteItem(node.get('parentNode'));
		}
	}
		
	 Y.on('contextmenu', function(e) {
		if (e.target.ancestor(isWorkspace)) {
			LAGVE.deleteItem(e.target);
			e.preventDefault();
		}
	});
});

function showHelp() {document.getElementById('VE-help').style.visibility = 'visible';}

function hideHelp() {document.getElementById('VE-help').style.visibility = 'hidden';}