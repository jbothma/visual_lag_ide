LAGVEStmt = new Object();
LAGVEStmt.scriptName = 'statement.js';

getMyY().use('dd-drag','dd-drop','dd-proxy','node','event', function (Y) {
	
	/**
	 * 
	 * Adapted from Mark Ireland's YUI 3 implementation
	 * of http://developer.yahoo.com/yui/examples/dragdrop/dd-reorder.html
	 * on http://www.markireland.com.au/
	 * Permission to use in this project granted.
	 */
	
	// For deciding whether item is being dragged upwards.
	// or downwards.
	// Cache last mouse position.
	// Downwards is default.
	LAGVEStmt.goingUp	= false;
	LAGVEStmt.lastY		= 0;
	
	LAGVEStmt.newStatement = function() {
		var statement		= Y.Node.create( '<div class="statement"></div>' );		
		var statementUL		= Y.Node.create( '<ul></ul>' );
		
		//var placeholderLI	= Y.Node.create( '<li class="statement-placeholder">placeholder</li>' );
		//var placeholderLIDrop = new Y.DD.Drop({node: placeholderLI });
		
		/////// START TESTING NONSENSE ///////////
		actionContainer = LAGVEStmt.newStatementChildContainer()
		var bob = LAGVEActn.newAction();
		bob.setStyle('position','relative');
		actionContainer.append( bob );
		statementUL.append(actionContainer);		
		/////// END TESTING NONSENSE ///////////
		
		
		//statementUL.append(placeholderLI);
		
		statement.append(statementUL);
		
		Y.one('#workspace').append(statement);
	};
	
	LAGVEStmt.newStatementChildContainer = function() {
		var statementChildContainer	= Y.Node.create( '<li class="statement-child-container"></li>' );
	
		var actionContainerDrag = new Y.DD.Drag({ node: statementChildContainer });
		actionContainerDrag.plug(Y.Plugin.DDProxy, { moveOnEnd: false });
		
		var actionContainerDrop = new Y.DD.Drop({node: statementChildContainer });

		return statementChildContainer;
	};
		
	Y.DD.DDM.on('drop:over', function(e) {
		//Get a reference to out drag and drop nodes
		var dragNode = e.drag.get('node'),
			dropNode = e.drop.get('node');
		
		//Are we dropping on a li node?
		if (dropNode.get('tagName').toLowerCase() === 'li') {
			//Are we going down? (not going up)
			// then we want to insert below, but not below a placeholder
			if (!LAGVEStmt.goingUp && !dropNode.hasClass('statement-placeholder')) {
				var nextSibling = dropNode.get('nextSibling');
				if (isset(nextSibling)) {dropNode = nextSibling}				
			}
			//Add the node to this list
			dropNode.get('parentNode').insertBefore(dragNode, dropNode);
		}
	});

	Y.DD.DDM.on('drag:drag', function(e) {
		//Get the last y point
		var y = e.target.lastXY[1];
		//is it greater than the lastY var?
		if (y < LAGVEStmt.lastY) {
			//We are going up
			LAGVEStmt.goingUp = true;
		} else {
			//We are going down..
			LAGVEStmt.goingUp = false;
		}
		//Cache for next check
		LAGVEStmt.lastY = y;
	});

	Y.DD.DDM.on('drag:start', function(e) {
		//Get our drag object
		var drag = e.target;
		//Set some styles here
		drag.get('node').setStyle('opacity', '.25');
		// copy the node's contents into dragNode
		drag.get('dragNode').set('innerHTML', drag.get('node').get('innerHTML'));
		// make dragNode's style match node but at 50% opacity
		drag.get('dragNode').setStyles({
			opacity: '.5',
			borderColor: drag.get('node').getStyle('borderColor'),
			backgroundColor: drag.get('node').getStyle('backgroundColor')
		});
	});

	Y.DD.DDM.on('drag:end', function(e) {
		var drag = e.target;

		drag.get('node').setStyles({
			visibility: '',
			opacity: '1'
		});
	});

	Y.DD.DDM.on('drag:drophit', function(e) {
		var drop = e.drop.get('node'),
			drag = e.drag.get('node');

		//if we are not on an li, we must have been dropped on a ul
		if (drop.get('tagName').toLowerCase() !== 'li') {
			if (!drop.contains(drag)) {
				drop.appendChild(drag);
			}
		}
	});
});