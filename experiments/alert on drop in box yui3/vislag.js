YUI({
	filter:'raw'
}).use('console','dd-drop','dd-drag','node','event', function (Y) {
	
	// base area where productions are dropped and moved around on		
	var workSpace;
	// A box where things can be dropped 
	// to get out of the way temporarily
	var holdBox;
	/**
	 * @class DropReceiver
	 * Border gets emphasised when a DD is dragged over
	 * dropAction implementation left to subclass implementation
	 */
	var DropReceiver = function() {
// container DIV for whatever this is goin to represent
this.node = Y.Node.create('<div class="dropReceiver"></div>');
// Get this container object from its node
this.node.owner = this;
		
		
		
// Givs this a DT to let it catch drops
this.dt	= new Y.DD.Drop({node: this.node});
// Get this container object from its dt
this.dt.owner = this;
						
overAction = function(e) {
	this.owner.node.addClass('dragOver');
};
exitAction = function(e) {
	this.owner.node.removeClass('dragOver');
};

this.dt.on('drop:over', overAction);
this.dt.on('drop:exit', exitAction);

		/**
		 * Put the node in the given parent
		 * @param {Node} parent
		 */
		this.render = function(parent) {
			parent.appendChild(this.node);
		}
		
		return this;
	}
	
	/**
	 * @extends DropReceiver
	 * Is dragable.
	 * TODO: resize to accommodate the size 
	 * and number of children.
	 */
 	var Statement = function() {
		this.node.addClass('statement');
		
		// Make this Statement dragable
		this.dd	= new Y.DD.Drag({node: this.node});
		this.dd.owner = this;

		
		/**
		 * @description Handle things dropped onto this.node
		 * @param {Object} e
		 */ 
		// TODO: when called, it sees 'this' as the dt.
		// I guess that means this should extend DropTarget
		// and not just add it as a variable
		this.dropAction = function(e) {				
			var dragNode = e.drag.owner.node;
			
			// TODO: Statements should hold children
			// in a <UL>
			this.owner.node.appendChild(dragNode);
			
			// position nicely
			/*
			dragNode.setStyles('position','static');
			dragNode.setStyle('left','0px');
			dragNode.setStyle('top','0px');
			*/
			
			// fix border since it's not hovering any more
			// but exit didn't happen
			this.owner.node.removeClass('dragOver');
		};
		this.dt.on('drop:hit',	this.dropAction);
		
		return true;		
	};
	Statement.prototype = new DropReceiver();
	
	/**
	 * @extends DropReceiver
	 */
	var Workspace = function() {
		// Set ID
		// Workspace-specific style comes from #workspace CSS
		this.node.setAttribute('id', 'workspace');
		
		// handle things dropped onto this
		this.dropAction = function(e) {				
			var dragNode = e.drag.owner.node;
			
			this.owner.node.appendChild(dragNode);
			
			dragNode.setStyles({
				'position':	'static'
			});
				
			// fix border since it's not hovering any more
			// but exit didn't happen
			this.owner.node.removeClass('dragOver');
		};
		this.dt.on('drop:hit',	this.dropAction);
		
		return true;
	};
	Workspace.prototype = new DropReceiver();
	
	/**
	 * @extends DropReceiver
	 */
	var HoldBox = function(){
		// Set ID
		// Workspace-specific style comes from #dropBox CSS
		this.node.setAttribute('id', 'holdBox');
		
		// handle things dropped onto this
		this.dropAction = function(e) {				
			var dragNode = e.drag.owner.node;
			
			this.owner.node.appendChild(dragNode);
					
			dragNode.setStyles({
				'position':	'static'
			});
			
			// fix border since it's not hovering any more
			// but exit didn't happen
			this.owner.node.removeClass('dragOver');
		};
		this.dt.on('drop:hit',	this.dropAction);
		
		return true;
	};
	HoldBox.prototype = new DropReceiver();
	
	//add a statement production to the workspace
	/**
	 * @description Creates a new statement and renders it in #workspace
	 */
	var newStatement = function() {
		var statement = new Statement();
		statement.render(workSpace.node);
	};

	function init(){				
		(workSpace 	= new Workspace()).render(Y.one('body'));
		(holdBox 	= new HoldBox()).render(Y.one('body'));


		// Click button to add a statement production to the workspace
		Y.one('button#newStatement').on('click',newStatement);
		
	};
	Y.on("domready", init);

});