LAGVE = new Object();
LAGVE.scriptName = 'visual_editor.js';
LAGVE.dropStack = new Array;

getMyY().use('node-menunav','console', 'io', 'dd-ddm-drop', function(Y) {
    //new Y.Console().render();

    LAGVE._init = function() {
        LAGVE._findWindow();
        LAGVE._findMainMenu();
        LAGVE._findAttrMenu();
        LAGVE._findWorkspace();
        
        LAGVE._setupMainMenu();
        LAGVE._setupWorkspace();
        LAGVE.getHelp();
        
        LAGVE._editorReady();        
    }    
    
    LAGVE._editorReady = function() {
        Y.one('#VE-loading-msg').setStyle('visibility','hidden');
        LAGVE.window.setStyle('visibility','');
        LAGVE.sizeWindow(Y.one('window').get('innerHeight'));
    }
    
    LAGVE._findWindow   = function() {
        LAGVE.window    = Y.one('#VE-window');
    }
    
    LAGVE._findAttrMenu = function() {
        LAGVE.attrMenu  = Y.one("#LAG-Attr-Menu");
            
        LAGVE.attrMenu.attrMenuLabel = Y.one('#LAG-Attr-menulabel');
    }
    
    LAGVE._findMainMenu = function() {
         LAGVE.mainMenu = Y.one("#VE-menu");
    }
    
    LAGVE._findWorkspace    = function() {
        LAGVE.workspace     = Y.one('#VE-workspace');
    }
    
    LAGVE._setupMainMenu    = function() {
        LAGVE.mainMenu.plug(
            Y.Plugin.NodeMenuNav, 
            {    autoSubmenuDisplay:    false,
                mouseOutHideDelay:    999999,
                submenuShowDelay:    0,
                submenuHideDelay:    999999
            });
    }
    
    LAGVE._setupWorkspace   = function() {
        var workspaceDT     = new Y.DD.Drop({ node: LAGVE.workspace });
        
        //create initialization
            
        var initialization = LAGVE._createInitialization();
        LAGVE.select(initialization);
        LAGVE.workspace.append(initialization);
        
        //create implementation
        LAGVE.workspace.append(LAGVE._createImplementation());
    }
    
    LAGVE._createInitialization = function() {
        LAGVE.initialization            = Y.Node.create( '<div id="initialization" class="selectable"></div>' );
        LAGVE.initialization.resize     = function( reason ) {
            Y.log('resize reached Initialization | ' + reason);
        }
        LAGVE.initialization.select     = LAGVE._genericSelect;
        LAGVE.initialization.deSelect   = LAGVE._genericDeSelect;
        
        var title = Y.Node.create( '<div id="initialization-title">INITIALIZATION</div>' );
        
        var statementBox = LAGVEStmt.newStatement();
        statementBox.removeClass('deletable');
        // It'd be ambiguious if Initialization statement
        // block could be selected because it's prettier
        // if Init is selectable and Init's selectedness
        // is passed through to the statement block anyway.
        statementBox.removeClass('selectable');
        statementBox.setStyle('minWidth','400px');
        statementBox.setStyle('minHeight','150px');
        
        LAGVE.initialization.append(title);
        LAGVE.initialization.append(statementBox);
        
        /**
         *    Pass Initialization's LAGVEInsert to statementBox's
         */
        LAGVE.initialization.LAGVEInsert = function(node) {
            statementBox.LAGVEInsert(node);
        }
        
        return LAGVE.initialization;
    }
    
    LAGVE._createImplementation = function() {
        LAGVE.implementation            = Y.Node.create( '<div id="implementation" class="selectable"></div>' );
        LAGVE.implementation.resize     = function( reason ) {
            Y.log('resize reached Implementation | ' + reason);
        };
        LAGVE.implementation.select     = LAGVE._genericSelect;
        LAGVE.implementation.deSelect   = LAGVE._genericDeSelect;
        
        var title = Y.Node.create( '<div id="implementation-title">IMPLEMENTATION</div>' );
        
        var statementBox = LAGVEStmt.newStatement();
        statementBox.removeClass('deletable');
        // It'd be ambiguious if implementation statement
        // block could be selected because it's prettier
        // if Init is selectable and Init's selectedness
        // is passed through to the statement block anyway.
        statementBox.removeClass('selectable');
        statementBox.setStyle('minWidth','400px');
        statementBox.setStyle('minHeight','150px');
        
        LAGVE.implementation.append(title);
        LAGVE.implementation.append(statementBox);
        
        /**
         *    Pass Initialization's LAGVEInsert to statementBox's
         */
        LAGVE.implementation.LAGVEInsert = function(node) {
            statementBox.LAGVEInsert(node);
        }
        
        return LAGVE.implementation;
    }
    /**
    *    LAGVE.insertNewAttr
    *    
    *    Insert attribute and hide menu automatically
    */
    LAGVE.insertNewAttr = function(attributeLevelsArr, targetId) {
        LAGVEAttr.insertNewAttr(attributeLevelsArr, targetId);
        LAGVE.attrMenu.addClass('yui-menu-hidden');
        LAGVE.attrMenu.attrMenuLabel.removeClass('yui-menu-label-menuvisible');
    }
    
    /**
     *    Selectable nodes that don't have specific
     *    de-select actions can set their select() to this one
     */
    LAGVE._genericSelect = function() {
        // give it the selected class which makes it obvious it's selected
        this.addClass('selected');
    }
    
    /**
     *    Selectable nodes that don't have specific
     *    de-select actions can set their deSelect() to this one
     */
    LAGVE._genericDeSelect = function() {
        //remove clas from previously selected item
        this.removeClass('selected');
    }
    
    LAGVE.select = function (selectedNode) {
        if (isset(selectedNode)) {
            // if the thing I clicked on is something I can select
            if (selectedNode.hasClass('selectable')) {
                if (isset(LAGVE.selectedNode)) {
                    LAGVE.selectedNode.deSelect();
                }
                // replace or set LAGVE.seletedNode to the thing I selected
                LAGVE.selectedNode = selectedNode;
                LAGVE.selectedNode.select();                
            } else {
                // limit/safety stop case
                if (selectedNode.hasClass('select-propagation-stop') || selectedNode.get('tagName') === 'body') {
                    return
                } else {
                    LAGVE.select(selectedNode.get('parentNode'));
                }
            }
        }
    }
    
    LAGVE.getHelp = function() {
        var uri = 'help.htm';
     
        var request = Y.io(uri);
    }
    
    // Define a function to handle the response data.
    LAGVE.getHelpComplete = function(id, o, args) {
        var id = id; // Transaction ID.
        var data = o.responseText;
        Y.one('#VE-help-container').append(Y.Node.create(data));
    };
    
    LAGVE.sizeWindow = function(newHeight) {        
        LAGVE.window.setStyle('height', (newHeight-30) + 'px');
        LAGVE.workspace.setStyle('height', (newHeight-64) + 'px');
        //Y.log('LAGVE Window height set to ' + newHeight);
    }
    
    // Subscribe to event "io:complete", and pass an array
    // as an argument to the event handler "complete", since
    // "complete" is global.   At this point in the transaction
    // lifecycle, success or failure is not yet known.
    Y.on('io:complete', LAGVE.getHelpComplete);
    
    Y.on('contentready', LAGVE._init, 'body');
    
    Y.on('click', function(e){LAGVE.select(e.target)});
    
    Y.DD.DDM.on('drop:enter', function(e) {
        LAGVE.dropStack.push(e.drop.get('node'));
    });
    
    Y.DD.DDM.on('drop:exit', function(e) {
        LAGVE.dropStack.pop();
    });
    
    Y.DD.DDM.on('drag:end', function(e) {
        LAGVE.dropStack = new Array;
    });
    
    Y.DD.DDM.on('drag:start', function(e) {
        LAGVE.dropStack = new Array;
    });
    
    Y.on('windowresize', function(e) {
        LAGVE.sizeWindow(e.target.get('winHeight'));
    });
    
    Y.on('scroll', function(e) {
        // stop user from scrolling the window because we only want the editing window to scroll ever.
        // can still scroll with mouse middle click and drag, and with arrows.
        // this is a hack which should be avoided but i'll leve it here in case i dont find
        // a better solution.
        //scroll(0,0);
    });
    
});

LAGVE.showHelp = function() {document.getElementById('VE-help').style.visibility = 'visible';}

LAGVE.hideHelp = function() {document.getElementById('VE-help').style.visibility = 'hidden';}