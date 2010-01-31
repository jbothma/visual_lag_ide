LAGVEStmt = new Object();
LAGVEStmt.scriptName = 'statement.js';

getMyY().use('dd-drag','dd-drop','dd-proxy','node','event','console', function (Y) {
	new Y.Console().render();
	
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
		var statementUL		= Y.Node.create( '<ul class="statement-list"></ul>' );
		
		//var placeholderLI	= Y.Node.create( '<li class="statement-placeholder">placeholder</li>' );
		//var placeholderLIDrop = new Y.DD.Drop({node: placeholderLI });
		var statementULDrop = new Y.DD.Drop({node: statementUL });
		
		/////// START TESTING NONSENSE ///////////
		statementChildContainer = LAGVEStmt.newStatementChildContainer()
		var testAction = LAGVEActn.newAction();
		testAction.setStyle('position','relative');
		statementChildContainer.oldList = statementUL;
		statementChildContainer.append( testAction );
		statementUL.append(statementChildContainer);		
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
			if (!LAGVEStmt.goingUp) {
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
		var dragNode = e.target.get('node');
		//Set some styles here
		dragNode.setStyle('opacity', '.25');
		// copy the node's contents into dragNode
		dragNode.set('innerHTML', dragNode.get('innerHTML'));
		// make dragNode's style match node but at 50% opacity
		dragNode.setStyles({
			opacity: '.5',
			borderColor: 		dragNode.getStyle('borderColor'),
			backgroundColor: 	dragNode.getStyle('backgroundColor')
		});
	});

	Y.DD.DDM.on('drag:end', function(e) {
		Y.log('drag:end');
		
		var dragNode = e.target.get('node');

		dragNode.setStyles({
			visibility: '',
			opacity: '1'
		});
		
		removeEmptyStatement(dragNode)
	});

	Y.DD.DDM.on('drag:drophit', function(e) {
		Y.log('drag:drophit');
		
		var dropNode = e.drop.get('node'),
			dragNode = e.drag.get('node');

		//if we are not on an li, we must have been dropped on a ul
		if (dropNode.get('tagName').toLowerCase() !== 'li') {
			if (!dropNode.contains(dragNode)) {
				dropNode.appendChild(dragNode);
			}
		}
		
		//removeEmptyStatement(dragNode)
	});
	
	function removeEmptyStatement(dragNode){
		//if (isset(dragNode.oldList)) {
			if (dragNode.oldList.get('parentNode').hasClass('statement')) {
				var hasChildren = dragNode.oldList.hasChildNodes();
				if (!hasChildren) {
					Y.log('Node\' old statement list is now empty - removing it.');
					
					dragNode.oldList.get('parentNode').remove();
				}
		//	}
		}

		var list = dragNode.get('parentNode');
		if (list.hasClass('statement-list')) {
			Y.log('Updating dragNode.oldList.');
			
			dragNode.oldList = list;
		}
	}
});