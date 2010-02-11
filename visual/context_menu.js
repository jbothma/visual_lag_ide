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
    
    
    LAGVEContext._init = function() {
        // MENU
        LAGVEContext.menu   = Y.Node.create( '<div id="context-menu"></div>' );
        
        // MENU ITEM
        var menuItemDelete  = Y.Node.create( '<div id="delete" class="context-menu-item">Delete</div>' );
        menuItemDelete.on('click',function() { LAGVEContext.deleteItem(LAGVEContext.context); });
        //menuItemDelete.on('click',LAGVEContext.deleteItem,LAGVEContext.context);
        LAGVEContext.menu.append(menuItemDelete);
        
        // create context menu (but it should be hidden by CSS until needed
        Y.one('body').append(LAGVEContext.menu);
    }
    
    LAGVEContext._isWorkspace = function(node) {
        return node.get('id') === 'VE-workspace';
    }
    
    /**
     *    LAGVE.deleteItem
     *
     *    Recursively search ancestors of given node until:
     *    - node with class 'deletable' is found and removed
     *    - workspace node is found
     *    - body tag is found
     */
    LAGVEContext.deleteItem = function(node) {
        // limit/safety stop case
        if (LAGVEContext._isWorkspace(node) || node.get('tagName') === 'body') {
            return
        }
        
        if (node.hasClass('deletable')) {
            var parent = node.get('parentNode');
            
            // Do work
            if (confirm('Are you sure you want to delete this ' + node.getName() + '?')) {
                node.remove();
                parent.resize('context delete');
                LAGVE.select(parent);
            }
            
        } else {
            // Recurse
            LAGVEContext.deleteItem(node.get('parentNode'));
        }
    }
        
     Y.on('contextmenu', function(e) {
        LAGVEContext.context = e.target;
        if (LAGVEContext.context.ancestor(LAGVEContext._isWorkspace)) {
            LAGVEContext.menu.setStyles({
                left:       e.clientX + 'px',
                top:        e.clientY + 'px',
                visibility: 'visible',
            });
            e.preventDefault();
        }
    });
    
    Y.on('click', function() {
        LAGVEContext.menu.setStyle('visibility','hidden');
    });
    
    Y.on("contentready", LAGVEContext._init,"body");
});