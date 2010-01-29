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

	var appendNode = function(target,node) {
		target.append(node);
		node.setStyle('position','relative');
		node.setStyle('left',0);
		node.setStyle('top',0);
		//Y.log('appendNode target: ' + target.getAttribute('class'));
		//Y.log('appendNode node: ' + node.getAttribute('class'));
	}
	
	Y.DD.DDM.on('drop:enter',function(e) {
		appendNode(e.drop.node,e.drag.node)
		//Y.log('drop:enter');
	});
	
	Y.DD.DDM.on('drop:hit',function(e) {
		appendNode(e.drop.node,e.drag.node);
		//Y.log('drop:hit');
	});
	
	var workspace = Y.one('#VE-workspace');
	var workspaceDT = new Y.DD.Drop({ node:  workspace });
	workspaceDT.node = workspace;
});

function showHelp() {document.getElementById('VE-help').style.visibility = 'visible';}

function hideHelp() {document.getElementById('VE-help').style.visibility = 'hidden';}