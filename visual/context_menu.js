LAGVEContext = new Object();
LAGVEContext.scriptName = 'context_menu.js';

getMyY().use('event', function(Y) {

	/*
	switch (context.name) {
		case 'action': _useButton(LAGVEContext.action);
		case 'x': _useButton(LAGVEContext.x);
	}
	
	context.hasClass('deletable') { _useButton(LAGVEContext.delete) };
	*/
	
	
	
	// MENU
	LAGVEContext.menu		= Y.Node.create( '<div id="context-menu"></div>' );
	
	// MENU ITEM
	var menuItemDelete	= Y.Node.create( '<div id="delete" class="context-menu-item">Delete</div>' );
	menuItemDelete.on('click',function() { LAGVEContext.deleteItem(LAGVEContext.context); });
	//menuItemDelete.on('click',LAGVEContext.deleteItem,LAGVEContext.context);
	LAGVEContext.menu.append(menuItemDelete);
	
	// render context menu (but it should be hidden until needed by CSS
	Y.one('body').append(LAGVEContext.menu);
	
	
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
	LAGVEContext.deleteItem = function(node) {
		// limit/safety stop case
		if (isWorkspace(node) || node.get('tagName') === 'body') {
			return
		}
		
		if (node.hasClass('deletable')) {
			// Do work
			if (confirm('Are you sure you want to delete this item?')) {
				node.remove();
				return;
			}
		} else {
			// Recurse
			LAGVEContext.deleteItem(node.get('parentNode'));
		}
	}
		
	 Y.on('contextmenu', function(e) {
		LAGVEContext.context = e.target;
		if (LAGVEContext.context.ancestor(isWorkspace)) {
			LAGVEContext.menu.setStyles({	left:		e.clientX + 'px',
											top:		e.clientY + 'px',
											visibility:	'visible'});
			e.preventDefault();
		}
	});
	
	Y.on('click', function() {
		LAGVEContext.menu.setStyle('visibility','hidden');
	});
});