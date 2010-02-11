/**
 *
 *
 */

LAGVECon = new Object();
LAGVECon.scriptName = 'connector.js';

getMyY().use('dd-constrain','dd-drop','dd-proxy','node','event', function (Y) {
    
    /*
     * functions that should be librarized soon
     */
    
    function handleMoved(handle) {
        // look up connector nodes
        var horiz       = handle.connectorNodes['horiz'];
        var topVert     = handle.connectorNodes['topVert'];
        var botVert     = handle.connectorNodes['botVert'];
        var topHandle   = handle.connectorNodes['topHandle'];
        var botHandle   = handle.connectorNodes['botHandle'];
        
        /* get and calculate */
        var topHandle_top   = topHandle.getY();
        var topHandle_left  = topHandle.getX();
        var botHandle_top   = botHandle.getY();
        var botHandle_left  = botHandle.getX();
        
        /* yes this is badly named. 
         * basically, top handle is seen as above, left of bottom handle
         * and positions need to be reversed if above assumptio is violated
         */
        var topOffset   = 0;
        var leftOffset  = 0;
        if (topHandle_top > botHandle_top)     { topOffset = -1 }
        if (topHandle_left > botHandle_left) { leftOffset = -1 }

        /* TODO: this can prob be simplified with something like handleDelta 
         * and only really need to calculate vert height once
         */
        var topVert_height  = Math.abs(Math.floor((topHandle_top - botHandle_top)/2))+3;
        var topVert_top     = topHandle_top + 2 + (topOffset * (topVert_height - 3));
        var topVert_left    = topHandle_left + 2;

        var horiz_width     = Math.abs(Math.floor(topHandle_left - botHandle_left))+3;
        var horiz_top       = topVert_top -3 + topVert_height + (topOffset * (topVert_height-3));
        var horiz_left      = topVert_left + (leftOffset * (horiz_width-3));

        var botVert_height  = Math.abs(Math.floor((topHandle_top - botHandle_top)/2))+3;
        var botVert_top     = horiz_top + (topOffset * (botVert_height - 3));
        var botVert_left    = horiz_left -3 + horiz_width + (leftOffset * (horiz_width-3));

        /* set */
        topVert.setY(topVert_top);
        topVert.setX(topVert_left);
        topVert.setStyle('height',topVert_height + 'px');

        horiz.setY(horiz_top);
        horiz.setX(horiz_left);
        horiz.setStyle('width',horiz_width + 'px');
        
        botVert.setY(botVert_top);
        botVert.setX(botVert_left);
        botVert.setStyle('height',botVert_height + 'px');
    }
    
    /**
     * 
     * @param {int} thl left offset px of top handle
     * @param {int} tht    top off    set px of top handle
     * @param {int} bhl left offset px of bot handle
     * @param {int} bht top offset px of bot handle
     */
    LAGVECon.newConnector = function(targetId) {

        var targetNode = Y.one('#' + targetId);

        // use these default coords until there's a better way to create a connector
        var thl = 30;
        var tht = 30;
        var bhl = 60;
        var bht = 60;

        /* TODONE:giving nodes references to other parts of the connector would
         * remove the need to look them up using classes for EACH MOVE
         * TODONE: check if all this class rubbish is then still needed or if
         * the node hash table can be always be used.
         * 
         * Not really needed but useful for knowing which connector parts belong to which
         * so i'll keep it around for the moment.
         * without being read they don't add huge overhead.
         */ 
        var topHandleId     = Y.guid('topHandle_');
        var botHandleId     = Y.guid('botHandle_');
        /*
         * Each section of a connector has the id of the handles as a class
         * so all the parts can be related to their handles and thus to each other
         */
        var topHandle     = Y.Node.create('<div id="' 
                                        + topHandleId
                                        + '" class="'
                                        + botHandleId
                                        + ' topHandle handle"></div>');
        var botHandle = Y.Node.create('<div id="' 
                                         + botHandleId
                                         + '" class="'
                                        + topHandleId
                                        + ' botHandle handle"></div>');
        var topVert         = Y.Node.create('<div id="" class="'
                                        + topHandleId + ' ' + botHandleId
                                        + ' topVert"></div>');
        var botVert         = Y.Node.create('<div id="" class="'
                                        + topHandleId + ' ' + botHandleId
                                        + ' botVert"></div>');
        var horiz         = Y.Node.create('<div id="" class="'
                                        + topHandleId + ' ' + botHandleId
                                        + ' horiz"></div>');
                                        
        
        /*
         * hash of all the nodes making up this connector
         */
        var connectorNodes = {
            'topHandle':    topHandle,
            'horiz':        horiz,
            'topVert':      topVert,
            'botVert':      botVert,
            'botHandle':    botHandle
        }

        for (var i in connectorNodes) {
            // add reference to hash of node references to each node for this connector
            connectorNodes[i].connectorNodes = connectorNodes;
            // add each node to the target Node
            targetNode.appendChild(connectorNodes[i]);
        }
        
        topHandle.setStyle('left',thl + 'px');
        topHandle.setStyle('top',tht + 'px');
        botHandle.setStyle('left',bhl + 'px');
        botHandle.setStyle('top',bht + 'px');
        
        // make handles dragable
        var ddTop   = new Y.DD.Drag({node:topHandle}).plug(
            Y.Plugin.DDConstrained, 
            { constrain2node: '#' + targetId}
        );

        var ddBot   = new Y.DD.Drag({node:botHandle}).plug(
            Y.Plugin.DDConstrained, 
            { constrain2node: '#' + targetId}
        );

        // make handle node accessible from the handle's DD
        ddTop.handle    = topHandle;
        ddBot.handle    = botHandle;
        
        // inserting counts as 'move' to get the lines into position
        handleMoved(topHandle);
    } // END newConnector()
    
    LAGVECon.newConnectable = function(targetId) {
        var targetNode      = Y.one('#' + targetId);

        var connectableId   =    Y.guid('connectable_');
        var connectable     =    Y.Node.create(    '<div id="' 
                                            + connectableId
                                            + '" class="connectable"></div>');
        var topConnPoint = Y.Node.create(    '<div class="topConnPoint connPoint"></div>');
        var botConnPoint = Y.Node.create(    '<div class="botConnPoint connPoint"></div>');

        // make connection point a drop target
        var tcpdt = new Y.DD.Drop({    node: topConnPoint });
        tcpdt.connPoint = topConnPoint;
        
        bcpdt = new Y.DD.Drop({    node: botConnPoint });
        bcpdt.connPoint = botConnPoint;
        
        // make connectable div dragable
        cdd = new Y.DD.Drag({ node: connectable }).plug(    Y.Plugin.DDConstrained, 
                                                            { constrain2node: '#' + targetId});

        cdd.connectable = connectable;
        
        connectable.appendChild(topConnPoint);
        connectable.appendChild(botConnPoint);
        
        var nodes = {
            'connectable':    connectable,
            'topConnPoint':    topConnPoint,
            'botConnPoint':    botConnPoint
        }

        for (var i in nodes) {
            // add reference to hash of node references to each node for this connector
            nodes[i].nodes = nodes;
        }
        
        
        
        targetNode.appendChild(connectable);
        
        return connectable;
    } // END newConnectable
    
    function connectableMoved(connectable) {
        var topConnPoint = connectable.nodes['topConnPoint'];
        var botConnPoint = connectable.nodes['botConnPoint'];
        
        
        if (isset(topConnPoint.handle)) {
            var handle = topConnPoint.handle;
            
            handle.setX(topConnPoint.getX() + 2);
            handle.setY(topConnPoint.getY() + 2);
            
            handleMoved(handle);
        }

        if (isset(botConnPoint.handle)) {
            botConnPoint.handle.setX(botConnPoint.getX() + 2);
            botConnPoint.handle.setY(botConnPoint.getY() + 2);
            
            handleMoved(botConnPoint.handle);
        }
    }
    
    function connectHandle(handle, connPoint) {
            connPoint.handle = handle;
            handle.connPoint = connPoint;
            connPoint.removeClass('can-connect');
            //alert('connected');
    }
    
    
    function disconnectHandle(handle) {
        if (isset(handle.connPoint)) {
            var connPoint = handle.connPoint;
            if (isset(connPoint.handle)) {
                connPoint.handle = null;
            }
            handle.connPoint = null
        }
        //alert('DISconnected');
    }
    
    /*
     * Add listeners
     */
    
    //Listen for all drag:drag events
    Y.DD.DDM.on('drag:drag', function(e) {
        var target = e.target;

        if (isset(target.handle)) {
            var node = target.handle;
            if (node.hasClass('handle')) {
                handleMoved(node);
            }
            //TODO: break out here to skip
            // checking for other sorts of dragables
        }
        
        if (isset(target.connectable)) {
            connectableMoved(target.connectable);
        }
    });
    
    //Listen for all drag:drophit events
    Y.DD.DDM.on('drag:drophit', function(e) {
        var drop = e.drop.get('node'),
            drag = e.drag.get('node');

        if (drop.hasClass('connPoint') && drag.hasClass('handle')) {
            connectHandle(drag,drop);
        }
    });
    
    //Listen for all drag:dropmiss events
    Y.DD.DDM.on('drag:dropmiss', function(e) {
        if (isset(e.target.handle)) {
            disconnectHandle(e.target.handle);
        }
    });
    
    Y.DD.DDM.on('drag:over', function(e) {
        if (isset(e.drag.handle) && isset(e.drop.connPoint)) {
            e.drop.connPoint.addClass('can-connect');
        }
    });
    
    Y.DD.DDM.on('drag:exit', function(e) {
        if (isset(e.target.handle) && isset(e.drop.connPoint)) {
            e.drop.connPoint.removeClass('can-connect');
        }
    });
});
