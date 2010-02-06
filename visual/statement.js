LAGVEStmt = new Object();
LAGVEStmt.scriptName = 'statement.js';

getMyY().use('dd-drag','dd-drop','dd-proxy','node','event','console', function (Y) {
	//new Y.Console().render();
	
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
	LAGVEStmt.goingDown	= true;
	LAGVEStmt.lastY		= 0;
	
	/**
	 *	LAGVEStmt.newStatement
	 *
	 *	Creates a new LAG STATEMENT block.
	 *  Returns the statement.
	 *
	 *	Configurable by:
	 *	{
	 *		targetId		Id of node to which new statement must be appended, if set.
	 *		initialChild	A node that would be appended to the new statement, if set.
	 *	}
	 */
	LAGVEStmt.newStatement = function(targetNode) {
		var statement		= Y.Node.create( '<div class="statement deletable selectable"></div>' );		
		statement.LAGVEName = 'Statement Block';
		
		statement.LAGVEUL	= Y.Node.create( '<ul class="statement-list"></ul>' );

		var statementULDrop = new Y.DD.Drop({
			node:		statement.LAGVEUL,
			groups:		['statement-list'],
		});
		
		statement.append(statement.LAGVEUL);

		
		/**
		 * Function to insert nodes asked to be inserted.
		 */
		statement.LAGVEInsert = function(node) {
			if (node.hasClass('statement-child')) {
				statement.LAGVEUL.append(LAGVEStmt._newStatementChildContainer(node));				
			} else {
				//alert(node.LAGVEName + ' can not be inserted into a ' + statement.LAGVEName + '.');
				Y.log(node.LAGVEName + ' can not be inserted into ' + statement.LAGVEName + '.');
			}
		}
		
		if (isset(targetNode)) {
			targetNode.LAGVEInsert(statement);
		}
		return statement;
	};
	
	LAGVEStmt._newStatementChildContainer = function(child) {
		var childContainer	= Y.Node.create( '<li class="statement-child-container deletable"></li>' );
	
		var childContainerDrag = new Y.DD.Drag({
			node:		childContainer,
			groups:		['statement-list'],
		});
													
		childContainerDrag.plug(Y.Plugin.DDProxy, { moveOnEnd: false });
		
		var stateContainerDrop = new Y.DD.Drop({
			node:	childContainer,
			groups:	['statement-list'],
		});

		childContainer.append(child);
		
		return childContainer;
	};
	
	Y.DD.DDM.on('drag:over', function(e) {
		var topOfDropStack = LAGVE.dropStack.peek();
		if (topOfDropStack) {
			//Y.log('Top of stack is ' + topOfDropStack.get('id'));

			//Get a reference to out drag and drop nodes
			var dragNode = e.drag.get('node'),
				dropNode = topOfDropStack;
			
			//Are we dropping on a li node?
			if (dropNode.hasClass('statement-child-container')) {
				//Are we going down? (not going up)
				// then we want to insert below, but not below a placeholder
				if (LAGVEStmt.goingDown) {
					var nextSibling = dropNode.get('nextSibling');
					if (isset(nextSibling)) { 
						dropNode = nextSibling 
						dropNode.get('parentNode').insertBefore(dragNode, dropNode);
					} else {
						dropNode.get('parentNode').append(dragNode);
					}
				} else {
					dropNode.get('parentNode').insertBefore(dragNode, dropNode);
				}
			}
		
			if (dropNode.hasClass('statement-list') && !dropNode.contains(dragNode)) {
				dropNode.append(dragNode);
			}
		}
	});

	Y.DD.DDM.on('drag:drag', function(e) {
		//Get the last y point
		var y = e.target.lastXY[1];
		//is it greater than the lastY var?
		if (y < LAGVEStmt.lastY) {
			//We are going up
			LAGVEStmt.goingDown = false;
		} else {
			//We are going down..
			LAGVEStmt.goingDown = true;
		}
		//Cache for next check
		LAGVEStmt.lastY = y;
	});

	Y.DD.DDM.on('drag:start', function(e) {
		//Get our drag object
		var drag = e.target;
		
		drag.get('node').setStyles({
			opacity:	'.25'
		});
		
		drag.get('dragNode').set('innerHTML', drag.get('node').get('innerHTML'));
		
		// make dragNode's style match node but at 50% opacity
		drag.get('dragNode').setStyles({
			opacity: 	'.5',
			borderColor: 		drag.get('node').getStyle('borderColor'),
			backgroundColor: 	drag.get('node').getStyle('backgroundColor')
		});
	});

	Y.DD.DDM.on('drag:end', function(e) {
		//Y.log('drag:end');
		
		var dragNode = e.target.get('node');

		dragNode.setStyles({
			visibility: '',
			opacity: '1',
			filter: 'alpha(opacity = 100)'
		});
		
		// don't automatically remove for the moment,
		// let user delete manually
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