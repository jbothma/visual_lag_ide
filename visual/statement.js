LAGVEStmt = new Object();
LAGVEStmt.scriptName = 'statement.js';
LAGVEStmt.overHandledTimestamp = new Date().getTime();

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
	 */
	LAGVEStmt.newStatement = function(targetNode) {
		var statement		= Y.Node.create( '<div id=' + Y.guid('statement-') + ' class="statement deletable selectable"></div>' );
		
		statement.resize = function() {	
			// "bubble up"
			this.get('parentNode').resize('child statement.resize');
		}
		
		statement.LAGVEName = 'Statement Block';
		
		statement.LAGVEUL	= Y.Node.create( '<ul id=' + Y.guid('statement-ul-') + ' class="statement-list"></ul>' );
		statement.LAGVEUL.resize = statement.resize;
		
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
				var newChildContainer = LAGVEStmt._newStatementChildContainer(node)
				statement.LAGVEUL.append(newChildContainer);
				newChildContainer.parentChanged();
				node.resize('statement.LAGVEInsert');
			} else {
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
		
		childContainer.parentChanged = function() {
			if (this.get('parentNode')) {
				this.resize = this.get('parentNode').resize;
				this.resize('new parent');
			}
			if (this._oldParent) {
				this._oldParent.resize('parentChanged');
			}
			this._oldParent = this.get('parentNode');
		}

		childContainer.append(child);
		childContainer.parentChanged();
		
		return childContainer;
	};
		
	Y.DD.DDM.on('drag:over', function(e) {
		var topOfDropStack = LAGVE.dropStack.peek();
		if (topOfDropStack) {
			//Y.log('Top of stack is ' + topOfDropStack.get('id'));
			
			// Optimisation to prevent running through all this code for each containing
			// ancestor statement block ancestor. Each of these will fire the drag:over event 
			// but, using the LAGVE.dropStack, each will insert to the top statement block (correctly)
			// therefore we don't need to do it again for all of them on each move. The timestamp will
			// probably be the same for most if not all events fired for a given move.
			var currentTime = new Date().getTime();
			if (currentTime !== LAGVEStmt.overHandledTimestamp) {
				LAGVEStmt.overHandledTimestamp = currentTime;
				
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
							dragNode.parentChanged();
						}
					} else {
						dropNode.get('parentNode').insertBefore(dragNode, dropNode);
						dragNode.parentChanged();
					}
				}
			
				if (dropNode.hasClass('statement-list') && !dropNode.contains(dragNode)) {
					dropNode.append(dragNode);
					dragNode.parentChanged();
				}
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
		var dragNode = e.target.get('node');

		dragNode.setStyles({
			visibility: '',
			opacity: '1',
			filter: 'alpha(opacity = 100)'
		});
	});
});