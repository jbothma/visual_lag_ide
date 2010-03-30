
LAGVE = new Object();

/* UTILITY */
function isset(variable)
{
    return ( typeof(variable) == "undefined" || variable == null )?  false: true;
}


/**
 * Add peek() to the Javascript Array prototype
 * Returns the top of the stack or null
 * if the stack is empty without pop()ing it off.
 * http://ajax.sys-con.com/node/347048 accessed 06/02/2010
 * Reprint of Real-World AJAX: Secrets of the Masters published by SYS-CON ISBN 0-9777622-0-3 
 */
Array.prototype.peek = function(){
    if (this.length > 0){
        return this[this.length - 1];
    } else {
        return null;
    }
}

function indentOne(code) {
    code = LAGVE.oneIndentation + code;
    return code.replace(/\r\n/g,'\r\n' + LAGVE.oneIndentation);
}

/**
*   Define functions within Raphael for use in PEAL
*/
Raphael.fn.PEAL = {
    /**
    *   Raphael.PEAL.arrowhead
    *   An arrowhead with original length and width of 20.
    *   Arrowhead points upwards by default, and is rotated 
    *   about its tip by angle degrees.
    *   
    *   tipX, tipY - The X and Y coords of the tip of the arrowhead.
    *   angle - the rotation of the arrowhead in degrees.
    */
    arrowhead: function(tipX, tipY, angle) {
        var pathData = 
            "M" + tipX + " " + tipY +           // start point
            "L" + (tipX+10) + " " + (tipY+20) + // draw first line
            "L" + (tipX-10) + " " + (tipY+20) + // draw second line
            "Z";                                // close path
        var head = this.path(pathData);
        head.attr("fill", "black");
        
        if (angle)
            head.rotate(angle, tipX, tipY);
            
        return head;
    }
    
}

LAGVE.Attr = new Object();

YUI({
    filter:     'raw',
    //combine:    true,
}).use(
    'console',
    'dd-constrain',
    'dd-ddm-drop',
    'dd-drag',
    'dd-drag-plugin',
    'dd-drop',
    'dd-drop-plugin',
    'dd-proxy',
    'event',
    'io',
    'node',
    'node-menunav',
    function (Y) {

    /**
     *    LAGVE.Attr
     *
     *    Library for the LAG Visual Editor Attribute item
     */ 
 
    
    /**
     *   e.g. insertNewAttr('UM.GM.Concept.experience,some.yui.node.object)
     */
    LAGVE.Attr.insertNewAttr = function(value,targetNode) {
        var newAttribute = Y.Node.create('<div class="attr_box"></div>');
        newAttribute.valueContainer = Y.Node.create('<div class="attr_box_value">' + value + '</div>');
        
        newAttribute.append(newAttribute.valueContainer);
        
        newAttribute._LAGVEName = 'Attribute/Value';
        newAttribute.getName = function() { return this._LAGVEName }        
        newAttribute.setName = function(newName) { this._LAGVEName = newName }

        newAttribute.contextMenuItems = LAGVEContext.items.visualElement;
        newAttribute.on('contextmenu', LAGVEContext.contextMenuHandler);
        
        newAttribute.resize = function(reason) {
            //Y.log('newAttribute.resize triggered by ' + reason);
            // Setup
            var valueWidth      = parseInt(this.valueContainer.getComputedStyle('width'));
                        
            // Compute
            attributeWidth      = valueWidth + 28;
            
            // Output
            this.setStyle('width', attributeWidth + 'px');
            
            //bubble
            this.get('parentNode').resize('attribute resize | ' + reason);
        }
        
        // make the attribute box dragable
        var attributeDD = new Y.DD.Drag({
            node:    newAttribute,
            groups:    ['attribute'],
        });
        
        //constrain attributes to their initial target for now.
        //TODO: should prob be a sparate parameter once attributes 
        //can be inserted in context.
        /*attributeDD.plug(    Y.Plugin.DDConstrained,
                            { constrain2node: Y.one('body') } );*/
                                             
        newAttribute.addClass('assignment-child');
        newAttribute.addClass('comparison-child');
        
        newAttribute.getValue = function() {
            return this.valueContainer.get('innerHTML');
        }
        
        newAttribute.setValue = function(newValue) {
            this.valueContainer.set('innerHTML', newValue);
            this.resize();
        }
        
        newAttribute.toLAG = function() {
            return this.getValue();
        }
        
        if (isset(targetNode)) {
            targetNode.LAGVEInsert(newAttribute);
        } 
        
        return newAttribute;
    }
    
    
    // Modify a new value to behave like a condition
    LAGVE.Attr.newBoolean = function(value, targetNode) {        
        // Is the attribute 'true' or 'false'?
        if ( value in {'true':1, 'false':1} ) {
            var newBoolean = LAGVE.Attr.insertNewAttr(value, targetNode);
            newBoolean.addClass('condition');
            newBoolean.dd.addToGroup('condition');
            
            newBoolean.parentChanged = function() {};
            
            if (isset(targetNode)) {
                targetNode.LAGVEInsert(newBoolean);
            }
            
            return newBoolean;
        } else {
            Y.error(value + 'is not a valid Boolean value');
        }
    }


/* Assignment Statement */

    LAGVE.Assignment = new Object();
    
    LAGVE.Assignment.newAssignment = function(targetNode) {
        //////    ASSIGNMENT    //////
        var assignment      = Y.Node.create( '<div class="assignment statement-list-child"></div>' );
        assignment.resize   = function(reason) {
            //Y.log('assignment.resize triggered by ' + reason);
            // Setup
            var attributeContainerWidth = parseInt(this.attributeContainer.getComputedStyle('width'));
            var valueContainerWidth     = parseInt(this.valueContainer.getComputedStyle('width'));
            var operatorContainerWidth  = parseInt(this.operatorContainer.getComputedStyle('width'));
                        
            // Compute
            assignmentWidth = attributeContainerWidth + operatorContainerWidth + valueContainerWidth + 22;
            
            // Output
            this.setStyle('width', assignmentWidth + 'px');
            
            // Bubble
            this.get('parentNode').resize('assignment.resize | ' + reason);
        }
        assignment._LAGVEName     = 'Assignment';
        assignment.getName        = function() { return this._LAGVEName };
        
        //////    ATTRIBUTE CONTAINER    //////
        assignment.attributeContainer               = Y.Node.create('\
            <div    class="assignment-attribute-container assignment-child-container selectable" \
                    \title="Drop an attribute here."></div>\
        ');
        assignment.attributeContainer._LAGVEName    = 'Assignment attribute';
        assignment.attributeContainer.select        = LAGVE._genericSelect;
        assignment.attributeContainer.deSelect      = LAGVE._genericDeSelect;
        assignment.attributeContainer.LAGVEInsert   = function(node) {
            if (LAGVE.Assignment.tryInsertAssignmentChild(assignment.attributeContainer,node)) {
                node.resize('assignment.attributeContainer.LAGVEInsert');
            }
        };
        assignment.attributeContainer.getName       = function() { return this._LAGVEName };
        assignment.attributeContainer.resize        = function( reason ) { 
            assignment.resize('child assignment.attributeContainer.resize | ' + reason) 
        };
        new Y.DD.Drop({
            node:        assignment.attributeContainer,
            groups:        ['attribute'],
        });
        
        assignment.attributeContainer.contextMenuItems = LAGVEContext.items.attributeContainer;
        assignment.attributeContainer.on('contextmenu', LAGVEContext.contextMenuHandler);
        
        
        //////    VALUE CONTAINER    //////
        assignment.valueContainer               = Y.Node.create('\
            <div class="assignment-attribute-container assignment-child-container selectable" \
            title="Drop an attribute or value here."></div>\
        ');
        assignment.valueContainer._LAGVEName    = 'Assignment value';
        assignment.valueContainer.select        = LAGVE._genericSelect;
        assignment.valueContainer.deSelect      = LAGVE._genericDeSelect;
        assignment.valueContainer.resize        = function( reason ) { 
            assignment.resize('child assignment.valueContainer.resize | ' + reason);
        };
        new Y.DD.Drop({
            node:    assignment.valueContainer,
            groups:    ['attribute'],
        });
        assignment.valueContainer.LAGVEInsert   = function(node) {
            if (LAGVE.Assignment.tryInsertAssignmentChild(assignment.valueContainer,node)) {
                node.resize('assignment.valueContainer.LAGVEInsert');
            }
        };
        assignment.valueContainer.getName       = function() { return this._LAGVEName };
        
        assignment.valueContainer.contextMenuItems = LAGVEContext.items.valueContainer;
        assignment.valueContainer.on('contextmenu', LAGVEContext.contextMenuHandler);
        
        //////    OPERATOR CONTAINER    //////
        assignment.operatorContainer    = Y.Node.create('\
            <div class="assignment-operator-container assignment-child-container" \
            title="Select an operator from the list."></div>\
        ');
        assignment.operatorSelect       =  Y.Node.create(
            '<select class="operator-select">\
                <option value=""></option>\
                <option value="=">=</option>\
                <option value="+=">+=</option>\
                <option value="-=">-=</option>\
                <option value=".=">.=</option>\
            </select>'
        );
        assignment.operatorContainer.append(assignment.operatorSelect);
        
        
        //////      BUILD AND INSERT/RETURN    //////
        assignment.append(assignment.attributeContainer);
        assignment.append(assignment.operatorContainer);
        assignment.append(assignment.valueContainer);
        
        /**
        *   Set the operator of the Assignment to the operator passed, if found.
        *   @argument str operator - The operator we want to select.
        */
        assignment.setOperator = function(operator) {
            var wantedOption;
            this.operatorSelect.get('childNodes').each(
                function(currentNode) {
                    if (currentNode.get('value') === operator) {
                        wantedOption = currentNode;
                    }
                }
            );
            
            if (wantedOption) wantedOption.set('selected', 'selected');            
        }
        
        assignment.attributeContainer.toLAG = function() {
            if (this.hasChildNodes()) {
                return this.get('firstChild').toLAG();
            }
            return '';
        }
        assignment.operatorContainer.toLAG = function() {
            return this.get('firstChild').get('value');
        }
        assignment.valueContainer.toLAG = function() {
            if (this.hasChildNodes()) {
                return this.get('firstChild').toLAG();
            }
            return '';
        }
        assignment.toLAG = function() {
            var LAG = 
                this.attributeContainer.toLAG() + ' ' +
                this.operatorContainer.toLAG() + ' ' +
                this.valueContainer.toLAG();
            
            return LAG;
        }
                
        if (isset(targetNode)) {
            targetNode.LAGVEInsert(assignment);
        }
        
        return assignment;
    }
    
    LAGVE.Assignment.tryInsertAssignmentChild = function(target,child) {
        if (target.hasClass('assignment-child-container')) {
            if (child.hasClass('assignment-child')) {
                if (!target.hasChildNodes()) {            
                    target.append(child);
                    target.resize('LAGVE.Assignment.tryInsertAssignmentChild');
                    return true;
                }
        
                LAGVE.Assignment._positionChild(child);
            }
        }
        return false;
    }
    
    LAGVE.Assignment._positionChild = function(child) {
        if (child.hasClass('assignment-child')) {
            child.setStyles({
                position:    'relative',
                left:        '0px',
                top:        '0px',
            });
        }
    }
    
    Y.DD.DDM.on('drop:enter',function(e) {
        LAGVE.Assignment.tryInsertAssignmentChild(e.drop.get('node'),e.drag.get('node'));
    });
    
    Y.DD.DDM.on('drop:hit',function(e) {
        LAGVE.Assignment.tryInsertAssignmentChild(e.drop.get('node'),e.drag.get('node'))
    });
    
    Y.DD.DDM.on('drag:dropmiss',function(e) {
        if (e.target.get('node').hasClass('assignment-child')) {
            LAGVE.Assignment._positionChild(e.target.get('node'));
        }
    });


/* IF-THEN-ELSE */
LAGVEIf = new Object();

        
    LAGVEIf.newIf = function(targetNode) {
        ////////     IF-THEN-ELSE     /////////
        var ifThenElse          = Y.Node.create('<div class="ifthenelse statement-list-child"></div>');
        ifThenElse._LAGVEName   = 'If-Then-Else block';
        ifThenElse.getName      = function() { return this._LAGVEName; }
        
        /**
         *
         */
        ifThenElse.resize = function(reason) {
            // Setup
            var conditionWidth  = parseInt(ifThenElse.conditionContainer.getComputedStyle('width'));
            var conditionHeight = parseInt(ifThenElse.conditionContainer.getComputedStyle('height'));
            var thenWidth       = parseInt(ifThenElse.thenBlock.getComputedStyle('width'));
            var thenHMargins    = parseInt(ifThenElse.thenBlock.getStyle('marginLeft')) + 
                                    parseInt(ifThenElse.thenBlock.getStyle('marginRight'));
            var elseWidth       = parseInt(ifThenElse.elseBlock.getComputedStyle('width'));
            var elseHMargins    = parseInt(ifThenElse.elseBlock.getStyle('marginLeft')) + 
                                    parseInt(ifThenElse.elseBlock.getStyle('marginRight'));
            
            // Compute
            /*    If block left side must be at least 100px to the right of Then block left side.
                If-Then-Else must be wider than the maximal of Then+Else and If
                Then block right side must be at least 100px to the right of the If block 
                but its left side no less than 100px to the left of the right side of the If block.
            */
            var ifHeight        = conditionHeight * 2.2;
            var ifWidth         = conditionWidth * 1.6;
            
            if (ifWidth < ifHeight*2) {
                ifWidth = ifHeight * 2;
            }
            
            var ifLeft          = thenWidth + thenHMargins - ifWidth/2;
            
            var conditionLeft   = (ifWidth - conditionWidth)/2;
            var conditionTop    = (ifHeight - conditionHeight)/2;
            
            if (ifLeft < 100) {
                ifLeft = 100;
            }
            
            var elseLeft        = ifLeft + ifWidth - 100 - thenWidth - 15;
            
            var ifThenElseWidth = Math.max((thenWidth + elseLeft + elseWidth + 43), (ifLeft + ifWidth + 100 + 15));
            
            // Output
            ifThenElse.conditionPositioning.setStyle('width', ifWidth + 'px');
            ifThenElse.conditionPositioning.setStyle('height', ifHeight + 'px');
            ifThenElse.conditionPositioning.setStyle('left', ifLeft + 'px');
            
            ifThenElse.conditionContainer.setStyle('left', conditionLeft + 'px');
            ifThenElse.conditionContainer.setStyle('top', conditionTop + 'px');
            
            ifThenElse.elseBlock.setStyle('left', elseLeft + 'px');
            ifThenElse.setStyle('width', ifThenElseWidth + 'px');
            
            // Bubble
            ifThenElse.get('parentNode').resize('ifThenElse.resize | ' + reason);
        }
        
        
        ///////    IF    ////////
        ifThenElse.conditionPositioning         = Y.Node.create('<div class="ifthenelse-condition-positioning selectable"></div>');
        ifThenElse.conditionPositioning.select  = function() {
            ifThenElse.rhombus.setStyle('visibility','hidden');
            ifThenElse.rhombusSelected.setStyle('visibility','visible');
        };
        ifThenElse.conditionPositioning.deSelect    = function() {
            ifThenElse.rhombusSelected.setStyle('visibility','hidden');
            ifThenElse.rhombus.setStyle('visibility','visible');
        };
        ifThenElse.conditionPositioning.LAGVEInsert = function(child) {
            ifThenElse.conditionContainer.LAGVEInsert(child);
        };
        ifThenElse.conditionPositioning.resize = function(reason) {
            Y.log('ifThenElse.conditionPositioning.resize triggered by ' + reason);
            // Setup
            var attributeContainerWidth = parseInt(ifThenElse.conditionContainer.getComputedStyle('width'));
                        
            // Compute
            conditionPositioningWidth   = attributeContainerWidth * 1.5;
            
            // Output
            this.setStyle('width', conditionPositioningWidth + 'px');
            
            // Bubble
            this.get('parentNode').resize('child assignment.resize | ' + reason);
        }
        
        ifThenElse.conditionPositioning.contextMenuItems = LAGVEContext.items.conditionContainer;
        ifThenElse.conditionPositioning.on('contextmenu', LAGVEContext.contextMenuHandler);
        
        
        ifThenElse.arrows           = Y.Node.create('<div class="ifthenelse-arrows"></div>');
        ifThenElse.arrowheadLeft    = Y.Node.create('<div class="ifthenelse-arrowhead-left"></div>');
        ifThenElse.arrowheadRight   = Y.Node.create('<div class="ifthenelse-arrowhead-right"></div>');
        ifThenElse.rhombus          = Y.Node.create(
            '<img alt="condition rhombus shape" \
                  class="ifthenelse-rhombus-image" \
                  src="images/ifthenelse_rhombus.png" >'
        );    
        ifThenElse.rhombusSelected  = Y.Node.create(
            '<img alt="condition rhombus shape selected" \
                 class="ifthenelse-rhombus-image-selected" \
                 src="images/ifthenelse_rhombus_selected.png" >'
        );
        
        ifThenElse.conditionContainer   = Y.Node.create('\
            <div class="ifthenelse condition-container"></div>\
        ');
        ifThenElse.conditionContainer.plug(
            Y.Plugin.Drop,
            {
                groups:    ['condition'],
            }
        );        
        ifThenElse.conditionContainer.resize        = function(reason) {
            ifThenElse.resize('ifThenElse.conditionContainer.resize | ' + reason);
        };
        ifThenElse.conditionContainer.LAGVEInsert   = function(child) {
            if (child.hasClass('condition')) {
                if (!ifThenElse.conditionContainer.hasChildNodes()) {            
                    ifThenElse.conditionContainer.append(child);
                    child.parentChanged();
                    child.resize('ifThenElse.conditionContainer.LAGVEInsert');
                }
            }
        }
        
                
        ///////    THEN and ELSE    ///////
        ifThenElse.thenAndElse = Y.Node.create('<div class="ifthenelse-thenelse"></div>');
        
        
        ///////    THEN    ////////
        ifThenElse.thenBlock = Y.Node.create('<div class="ifthenelse-then"></div>');
        ifThenElse.thenStatementBlock = LAGVEStmt.newStatement();
        ifThenElse.thenStatementBlock.addClass('ifthenelse-then-statement');
        ifThenElse.thenStatementBlock.resize = ifThenElse.resize;    // replace statement's resize()
        ifThenElse.thenBlock.append(ifThenElse.thenStatementBlock);
        ifThenElse.thenBlockTitle = Y.Node.create('<div class="ifthenelse-then-title">THEN</div>');
        
        
        ///////    ELSE    ////////
        ifThenElse.elseBlock = Y.Node.create('<div class="ifthenelse-else"></div>');
        ifThenElse.elseStatementBlock = LAGVEStmt.newStatement();
        ifThenElse.elseStatementBlock.addClass('ifthenelse-else-statement');
        ifThenElse.elseStatementBlock.resize = ifThenElse.resize;    // replace statement's resize()
        ifThenElse.elseBlock.append(ifThenElse.elseStatementBlock);
        ifThenElse.elseBlockTitle = Y.Node.create('<div class="ifthenelse-else-title">ELSE</div>');    
                
        /*    Node structure:
            
        ifThenElse
            conditionPositioning
                arrows
                    arrowhead left
                    arrowhead right
                rhombus
                rhombusSelected
                conditionContainer
            thenAndElse
                thenBlock
                    thenBlockTitle
                elseBlock
                    elseBlockTitle
        */
        ifThenElse.append(                      ifThenElse.conditionPositioning );
        ifThenElse.arrows.append(               ifThenElse.arrowheadLeft        );
        ifThenElse.arrows.append(               ifThenElse.arrowheadRight       );
        ifThenElse.conditionPositioning.append( ifThenElse.arrows               );
        ifThenElse.conditionPositioning.append( ifThenElse.rhombus              );
        ifThenElse.conditionPositioning.append( ifThenElse.rhombusSelected      );
        ifThenElse.conditionPositioning.append( ifThenElse.conditionContainer   );
        ifThenElse.append(                      ifThenElse.thenAndElse          );
        ifThenElse.thenAndElse.append(          ifThenElse.thenBlock            );
        ifThenElse.thenBlock.append(            ifThenElse.thenBlockTitle       );
        ifThenElse.thenAndElse.append(          ifThenElse.elseBlock            );
        ifThenElse.elseBlock.append(            ifThenElse.elseBlockTitle       );

        ifThenElse.raphael = Raphael(Y.Node.getDOMNode(ifThenElse), 320, 200);
        
        ifThenElse.canvas = Y.one(ifThenElse.raphael.canvas);
        
        ifThenElse.canvas.setStyles({
            position:   'absolute',
            top:        '0px',
            left:       '0px',
        });
        

        ifThenElse.toLAG = function() {
            var LAG = 
                'if ' + ifThenElse.conditionContainer.toLAG() + ' then (\r\n' + 
                ifThenElse.thenBlock.toLAG() + ')';
                
            // Else is optional
            var elseLAG = ifThenElse.elseBlock.toLAG();
            if (elseLAG !== '')
                LAG += ' else (\r\n' + elseLAG + ')';
            
            return LAG;
        }
        ifThenElse.conditionContainer.toLAG = function() {
            if (this.hasChildNodes()) {
                return this.get('firstChild').toLAG();
            }
            return '';
        }
        ifThenElse.thenBlock.toLAG = function() {
            var LAG = this.get('firstChild').toLAG();
            
            return LAG;
        }
        ifThenElse.elseBlock.toLAG = function() {
            var LAG = this.get('firstChild').toLAG();
            
            return LAG;
        }
        
        ifThenElse.lockDrops = function() {
            this.elseStatementBlock.lockDrops();
            this.thenStatementBlock.lockDrops();
        }
        
        ifThenElse.unlockDrops = function() {
            this.elseStatementBlock.unlockDrops();
            this.thenStatementBlock.unlockDrops();
        }
        
        if (isset(targetNode)) {
            targetNode.LAGVEInsert(ifThenElse);
            //ifThenElse.resize('new ifthenelse');
        }
                
        return ifThenElse;
    }
    
    
    Y.DD.DDM.on('drop:enter',function(e) {
        var dropNode = e.target.get('node');
        if (dropNode.hasClass('condition-container')) {
            dropNode.LAGVEInsert(e.drag.get('node'));
        }
    });
    
    
    LAGVE.Elements = new Object();

    
    LAGVE.Elements.newWhile = function(targetNode) {
        // .while.statement-list-child
        var newWhile = Y.Node.create('<div class = "while statement-list-child"></div>');
        // .while.condition-positioning
        newWhile.conditionPositioning = Y.Node.create(
            '<div class="while condition-positioning selectable"></div>');
        // .while.condition-container
        newWhile.conditionContainer   = Y.Node.create(
            '<div class="while condition-container"></div>');
        
        // .while.condition-rhombus
        newWhile.rhombus = Y.Node.create(
            '<img alt="condition rhombus shape" \
                  class="while condition-rhombus" \
                  src="images/ifthenelse_rhombus.png">');
                  
        // .while.condition-rhombus.selected
        newWhile.rhombusSelected = Y.Node.create(
            '<img alt="condition rhombus shape selected" \
                  class="while condition-rhombus selected" \
                  src="images/ifthenelse_rhombus_selected.png">');
                  
        // .while.multiple-documents-symbol
        newWhile.multiDocsSymbol = Y.Node.create(
            '<div class="while multiple-documents-symbol">\
                <img alt="multiple-documents-symbol" \
                     class="while multiple-documents-symbol" \
                     src="images/multiple_documents.png">\
                <span class="while multiple-documents-symbol">For each concept in the lesson</span>\
            </div>');
            
        // .while.arrowline.multidocs-to-rhombus
        newWhile.arrowlineMultidocsToRhombus = Y.Node.create(
            '<div class="while arrowline multidocs-to-rhombus"></div>');
        // .while.arrowline.rhombus-statements-multidocs
        newWhile.arrowlineRhombusStatementsMultidocs = Y.Node.create(
            '<div class="while arrowline rhombus-statements-multidocs"></div>');
        
        // .while.arrowhead-into-multidocs
        newWhile.arrowheadIntoMultidocs = Y.Node.create(
            '<img src="images/arrowhead_up.png" \
                  class="while arrowhead-into-multidocs">');
        // .while.arrowhead-into-rhombus
        newWhile.arrowheadIntoRhombus = Y.Node.create(
            '<img src="images/arrowhead_down.png" \
                  class="while arrowhead-into-rhombus">');
        // .while.arrowhead-into-statements
        newWhile.arrowheadIntoStatements = Y.Node.create(
            '<img src="images/arrowhead_down.png" \
                  class="while arrowhead-into-statements">');
                  
        // .while.statement
        newWhile.statementList = LAGVEStmt.newStatement();
        newWhile.statementList.addClass('while');
                
        newWhile._LAGVEName   = 'For Each Concept';
        newWhile.getName      = function() { return this._LAGVEName; }
        
        newWhile.conditionContainer.plug(
            Y.Plugin.Drop,
            {
                groups:    ['condition'],
            }
        );
        
        /*
            HTML elements in this order to overlap correctly.
            while
                arrowlineMultidocsToRhombus
                arrowlineRhombusStatementsMultidocs
                statementList
                arrowheadIntoMultidocs
                arrowheadIntoRhombus
                arrowheadIntoStatements
                multiDocsSymbol
                conditionPositioning
                    rhombus
                    rhombusSelected
                    conditionContainer
        */
        
        newWhile.append( newWhile.arrowlineMultidocsToRhombus               );
        newWhile.append( newWhile.arrowlineRhombusStatementsMultidocs       );
        newWhile.append( newWhile.statementList                             );
        newWhile.append( newWhile.arrowheadIntoMultidocs                    );
        newWhile.append( newWhile.arrowheadIntoRhombus                      );
        newWhile.append( newWhile.arrowheadIntoStatements                   );
        newWhile.append( newWhile.multiDocsSymbol                           );
        newWhile.append( newWhile.conditionPositioning                      );
        newWhile.conditionPositioning.append( newWhile.rhombus              );
        newWhile.conditionPositioning.append( newWhile.rhombusSelected      );
        newWhile.conditionPositioning.append( newWhile.conditionContainer   );
        
        newWhile.LAGVEInsert = function(child) {
            newWhile.statementList.LAGVEInsert(child);
        };
        
        newWhile.conditionContainer.LAGVEInsert   = function(child) {
            if (child.hasClass('condition')) {
                if (!this.hasChildNodes()) {            
                    this.append(child);
                    child.parentChanged();
                    child.resize('while.conditionContainer.LAGVEInsert');
                }
            }
        }
        
        newWhile.conditionPositioning.LAGVEInsert = function(child) {
            newWhile.conditionContainer.LAGVEInsert(child);
        };
        
        newWhile.conditionPositioning.select = function() {
            newWhile.rhombus.setStyle('visibility','hidden');
            newWhile.rhombusSelected.setStyle('visibility','visible');
        };
        newWhile.conditionPositioning.deSelect = function() {
            newWhile.rhombus.setStyle('visibility','visible');
            newWhile.rhombusSelected.setStyle('visibility','hidden');
        };
        
        newWhile.conditionPositioning.contextMenuItems = LAGVEContext.items.conditionContainer;
        newWhile.conditionPositioning.on('contextmenu', LAGVEContext.contextMenuHandler);
        
        newWhile.conditionContainer.toLAG = function() {
            if (this.hasChildNodes()) {
                return this.get('firstChild').toLAG();
            }
            return '';
        }
        newWhile.toLAG = function() {
            return 'while ' + this.conditionContainer.toLAG() + '(\n' + this.statementList.toLAG() + ')\n';
        };
        
        newWhile.resize = function() {
            // Setup
            var conditionWidth  = parseInt(this.conditionContainer.getComputedStyle('width'));
            var conditionHeight = parseInt(this.conditionContainer.getComputedStyle('height'));
            
            var statementListHeight = parseInt(this.statementList.getComputedStyle('height'));
            var statementListWidth = parseInt(this.statementList.getComputedStyle('width'));
            
            // Calculations
            var rhombusHeight        = conditionHeight * 2.2;
            var rhombusWidth         = conditionWidth * 1.6;
            
            if (rhombusWidth < rhombusHeight*2) {
                rhombusWidth = rhombusHeight * 2;
            }
            
            var conditionLeft   = (rhombusWidth - conditionWidth)/2;
            var conditionTop    = (rhombusHeight - conditionHeight)/2;
            
            // just below and to the right of the rhombus
            var statementListTop = rhombusHeight * 0.75 + 30;            
            var statementListLeft = rhombusWidth * 0.75 + 73;
            
            // this.multiDocsSymbol top is conditionPositioning height / 2 + offset
            var multiDocsSymbTop = (rhombusHeight / 2) + 20;
            
            // rhombus horiz midpoint + rhombus left - arrowlines left
            var arrowlineMultidocsToRhombusWidth = (rhombusWidth / 2) + 10;
            
            // bottom of div must be just below multidocs top
            var arrowlineMultidocsToRhombusHeight = multiDocsSymbTop;
            
            // multidocs bottom
            var arrowheadIntoMultidocsTop = multiDocsSymbTop + 65;
            
            // arrowlinesWidth + arrowlines left - half arrowhead width
            var arrowheadIntoRhombusLeft = arrowlineMultidocsToRhombusWidth + 48;
            
            // rhombusWidth + rhombusLeft + offset
            var arrowlineRhombusStatementsMultidocsWidth = rhombusWidth + 63;
            // rhombusHeight/2 + rhombusTop
            var arrowlineRhombusStatementsMultidocsTop = rhombusHeight/2 + 22;
            
            // statementListTop - arrowheadIntoStatements heigh
            var arrowheadIntoStatementsTop = statementListTop - 15;
            // arrowlineRhombusStatementsMultidocsWidth + left
            var arrowheadIntoStatementsLeft = arrowlineRhombusStatementsMultidocsWidth + 48;
            
            // this (the 'while' visual element container)
            // statementListTop + statementList height
            var whileHeight = statementListTop + statementListHeight + 5;
            var whileWidth = statementListLeft + statementListWidth + 5;
            
            
            // Output
            
            this.conditionPositioning.setStyle('width', rhombusWidth + 'px');
            this.conditionPositioning.setStyle('height', rhombusHeight + 'px');
            
            this.conditionContainer.setStyle('left', conditionLeft + 'px');
            this.conditionContainer.setStyle('top', conditionTop + 'px');
            
            this.multiDocsSymbol.setStyle('top', multiDocsSymbTop + 'px');
            
            this.arrowlineMultidocsToRhombus.setStyle('width', arrowlineMultidocsToRhombusWidth + 'px');
            this.arrowlineMultidocsToRhombus.setStyle('height', arrowlineMultidocsToRhombusHeight + 'px');
            
            this.arrowheadIntoMultidocs.setStyle('top', arrowheadIntoMultidocsTop + 'px');
            this.arrowheadIntoRhombus.setStyle('left', arrowheadIntoRhombusLeft + 'px');
            
            this.arrowlineRhombusStatementsMultidocs.
                setStyle('width', arrowlineRhombusStatementsMultidocsWidth + 'px');
            this.arrowlineRhombusStatementsMultidocs.
                setStyle('top', arrowlineRhombusStatementsMultidocsTop + 'px');
            this.arrowheadIntoStatements.
                setStyle('left', arrowheadIntoStatementsLeft + 'px');
            this.arrowheadIntoStatements.
                setStyle('top', arrowheadIntoStatementsTop + 'px');
                
            this.statementList.setStyle('top', statementListTop + 'px');
            this.statementList.setStyle('left', statementListLeft + 'px');
            
            this.setStyle('height', whileHeight + 'px');
            this.setStyle('width', whileWidth + 'px');
        }
        
        newWhile.conditionContainer.resize = function(reason) {
            newWhile.resize('newWhile.conditionContainer.resize | ' + reason);
        };
                
        if ( isset( targetNode )) {
            targetNode.LAGVEInsert(newWhile);
        }
        
        return newWhile;
    }
    
/* CONDITION */
LAGVE.Condition = new Object();


    /**
     *    Dragable, reorderable HTML LI
     *    To be called by the function creating a new condition, e.g. a new Comparison
     *    Returns the container LI after inserting the new condition.
     *    Parameters:    condition
     */
    LAGVE.Condition.wrapCondition = function(child) {
        var conditionWrapper = Y.Node.create( '<div class="condition wrapper"></div>' );
        conditionWrapper.contextMenuItems = LAGVEContext.items.visualElement;
        conditionWrapper.on('contextmenu', LAGVEContext.contextMenuHandler);
    
        var conditionWrapperDD = new Y.DD.Drag({
            groups:    ['condition'],
            node:    conditionWrapper,
        });
                                                    
        conditionWrapperDD.plug(
            Y.Plugin.DDProxy, 
            {
                moveOnEnd:    false,
            }
        );
        
        conditionWrapper.resize = function(reason) {             
            this.get('firstChild')._resize('conditionWrapper.resize')
            
            //Bubble
            this.get('parentNode').resize('conditionWrapper.resize')
        }
        conditionWrapper.parentChanged = function() {
            if (this.get('parentNode')) {
                //this.resize = this.get('parentNode').resize;
                //this.resize('new parent');
            }
            if (this._oldParent) {
                this._oldParent.resize('parentChanged');
            }
            this._oldParent = this.get('parentNode');
        }
        
        conditionWrapper.getName = function() {
            return child.getName();
        }
        conditionWrapper.toLAG = function() {
            return this.get('firstChild').toLAG();
        }

        conditionWrapper.append(child);
        conditionWrapper.parentChanged();        
        
        conditionWrapper.getCondition = function() { return this.get('firstChild') }
        
        return conditionWrapper;
    };
    
    LAGVE.Condition.newComparison = function(targetNode) {
        ///////    COMPARISON    ///////
        var comparison          = Y.Node.create( '<div class="comparison"></div>' );
        comparison._LAGVEName   = 'Comparison';        
        comparison.getName      = function() {
            return this._LAGVEName
        };
        
        comparison._resize = function(reason) {
            //Y.log('comparison._resize by ' + reason);
            // Setup
            var attributeContainerWidth     = parseInt(this.attributeContainer.getComputedStyle('width'));
            var comparatorContainerWidth    = parseInt(this.comparatorContainer.getComputedStyle('width'));
            var valueContainerWidth         = parseInt(this.valueContainer.getComputedStyle('width'));
                        
            // Compute
            var comparisonWidth                = attributeContainerWidth + comparatorContainerWidth + valueContainerWidth + 22;
            
            // Output
            this.setStyle('width', comparisonWidth + 'px');
            
            //NEVER call parent's resize(), it's the containing parent that calls this to resize.
        }
        
        comparison.resize = function( reason){
            this._resize('comparison.resize');
            
            this.get('parentNode').resize('comparison.resize');
        }
        
        
        //////    ATTRIBUTE CONTAINER    //////
        comparison.attributeContainer = Y.Node.create('\
            <div class="comparison-attribute-container comparison-child-container selectable" \
            title="Drop an attribute here."></div>\
        ');
        var attributeContainerDT = new Y.DD.Drop({
            node:    comparison.attributeContainer,
            groups:    ['attribute'],
        });
        
        comparison.attributeContainer._LAGVEName    = 'Attribute position';
        comparison.attributeContainer.getName       = function() {return this._LAGVEName};
        comparison.attributeContainer.select        = LAGVE._genericSelect;
        comparison.attributeContainer.deSelect      = LAGVE._genericDeSelect;
        comparison.attributeContainer.LAGVEInsert   = function(node) {
            if (LAGVE.Condition.tryInsertComparisonChild(comparison.attributeContainer,node)) {
                node.resize('comparison.attributeContainer.LAGVEInsert');
            }
        };
        comparison.attributeContainer.resize        = function(reason)     {
            comparison.resize('child comparison.attributeContainer.resize | ' + reason)
        };
        
        comparison.attributeContainer.contextMenuItems = LAGVEContext.items.attributeContainer;
        comparison.attributeContainer.on('contextmenu', LAGVEContext.contextMenuHandler);
        
        //////    COMPARATOR    //////
        comparison.comparatorContainer = Y.Node.create('\
            <div class="comparison-comparator-container comparison-child-container" \
            title="Select an comparator from the list."></div>\
        ');
        comparison.comparatorSelect =  Y.Node.create('\
            <select class="comparator-select">\
                <option value=""></option>\
                <option value="==">==</option>\
                <option value="&gt;">&gt;</option>\
                <option value="&gt;=">&gt;=</option>\
                <option value="&lt;">&lt;</option>\
                <option value="&lt;=">&lt;=</option>\
            </select>\
        ');
        
        /**
        *   Set the comparator of the Comparison to the comparator passed, if found.
        *   @argument str comparator - The comparator we want to select.
        */
        comparison.setComparator = function(comparator) {
            var wantedOption;
            this.comparatorSelect.get('childNodes').each(
                function(currentNode) {
                        if (currentNode.get('value') === comparator) {
                            wantedOption = currentNode;
                        }
                }
            );
            
            if (wantedOption) wantedOption.set('selected', 'selected');            
        }
        
        
        //////    VALUE CONTAINER    //////
        comparison.valueContainer            = Y.Node.create('\
            <div class="comparison-attribute-container comparison-child-container selectable" \
            title="Drop an attribute here."></div>\
        ');
        var valueContainerDT         = new Y.DD.Drop({
            node:    comparison.valueContainer,
            groups:    ['attribute'],
        });
        comparison.valueContainer._LAGVEName    = 'Value position';
        comparison.valueContainer.getName       = function()      { return this._LAGVEName };        
        comparison.valueContainer.LAGVEInsert   = function(node) {
            if (LAGVE.Condition.tryInsertComparisonChild(comparison.valueContainer,node)) {
                node.resize('comparison.valueContainer.LAGVEInsert');
            }
        };
        comparison.valueContainer.resize        = function( reason )     { 
            comparison.resize('child comparison.valueContainer.resize | ' + reason);
        };
        comparison.valueContainer.select        = LAGVE._genericSelect;
        comparison.valueContainer.deSelect      = LAGVE._genericDeSelect;
        
        comparison.valueContainer.contextMenuItems = LAGVEContext.items.valueContainer;
        comparison.valueContainer.on('contextmenu', LAGVEContext.contextMenuHandler);
        
        //////    BUILD, INSERT/RETURN    //////
        comparison.append( comparison.attributeContainer );
        comparison.comparatorContainer.append( comparison.comparatorSelect );
        comparison.append( comparison.comparatorContainer );
        comparison.append( comparison.valueContainer );
        
        comparison.attributeContainer.toLAG = function() {
            if (this.hasChildNodes()) {
                return this.get('firstChild').toLAG();
            }
            return '';
        }
        comparison.comparatorSelect.toLAG = function() {
            return this.get('value');
        }
        comparison.valueContainer.toLAG = function() {
            if (this.hasChildNodes()) {
                return this.get('firstChild').toLAG();
            }
            return '';
        }
        comparison.toLAG = function() {
            var LAG = 
                this.attributeContainer.toLAG() + ' ' +
                this.comparatorSelect.toLAG() + ' ' +
                this.valueContainer.toLAG();
            
            return LAG;
        }
        
        // Wrap comparison as a typical Condition
        var condition = LAGVE.Condition.wrapCondition( comparison );
        
        if ( isset( targetNode )) {
            targetNode.LAGVEInsert(condition);
        }
        
        return condition;
    }

    
    /**
     *  Enough construct
     */ 
    LAGVE.Condition.newEnough = function(options) {        
        var enough = Y.Node.create('\
            <div class="enough primary selectable">ENOUGH</div>\
        ');
        
        enough.threshold = Y.Node.create('\
            <input type="text" class="enough threshold" value="0">\
        ');
        
        enough.append(enough.threshold);
        
        enough._LAGVEName = 'Enough';
        enough.toLAG = function() {
            var LAG = 'enough(';
            
            this.conditionList.get('children').each(function() {
                LAG += this.toLAG() + '\n';
            });
            
            LAG += ',' + this.threshold.getValue() + ')';
            
            return LAG;
        }
 
        enough.getName       = function() {
            return this._LAGVEName;
        }
        
        enough.getThreshold = function() { 
            return this.threshold;
        }
        
        enough.threshold.setValue = function(newValue) {
            this.set('value', newValue);
        }
        enough.threshold.getValue = function() {
            return this.get('value');
        }
                
        enough._resize       = function() {}
        
        enough.select        = function() { 
            this.addClass('selected');
            enough.conditionList.select() 
        }
        
        enough.deSelect      = function() { 
            this.removeClass('selected');
            enough.conditionList.deSelect() 
        }
        
        enough.LAGVEInsert   = function(child) {
            enough.conditionList.LAGVEInsert(child);
        }
        
        enough.diagonal = Y.Node.create('\
            <div class="enough diagonal-container"></div>\
        ')
        
        enough.conditionList = Y.Node.create('\
            <div class="enough condition-list selectable"></div>\
        ')
        enough.conditionList.plug(
            Y.Plugin.Drop,
            {
                groups:    ['condition'],
            }
        )     
        enough.conditionList.resize        = function() {}
        enough.conditionList.select        = LAGVE._genericSelect;
        enough.conditionList.deSelect      = LAGVE._genericDeSelect;
        enough.conditionContainer = enough.conditionList;
        
        enough.conditionContainer.contextMenuItems = LAGVEContext.items.conditionContainer;
        enough.conditionContainer.on('contextmenu', LAGVEContext.contextMenuHandler);

        enough.conditionList.LAGVEInsert   = function(child) {
            if (child.hasClass('condition')) {          
                this.append(child);
                child.parentChanged();
                child.resize('enough.conditionList.LAGVEInsert');
            }
        }
        
        enough.append(enough.diagonal);
        enough.append(enough.conditionList);
        
        // Wrap enough in an LI as a generic Condition
        var condition = LAGVE.Condition.wrapCondition( enough );

        if ( isset( options ) && isset( options.targetNode )) {
            options.targetNode.LAGVEInsert(condition);
        }
        
        return condition;
    }
    
    LAGVE.Condition.tryInsertComparisonChild = function( target, child ) {
        if (target.hasClass('comparison-child-container')) {
            if (child.hasClass('comparison-child')) {
                if (!target.hasChildNodes()) {            
                    target.append(child);
                    target.resize('LAGVE.Condition.tryInsertComparisonChild');
                    return true;
                } else {
                    //Y.log('LAGVE.Condition.insertComparisonChild() didn\'t insert. Target had a child.');
                }
                
                LAGVE.Condition._positionChild(child);
            } 
        }
        return false;
    }
    
    LAGVE.Condition._positionChild = function(child) {
        if (child.hasClass('comparison-child')) {
            child.setStyles({   position:   'relative',
                                left:       '0px',
                                top:        '0px'});
        }
    }
    
    Y.DD.DDM.on('drop:enter',function(e) {
        var dropNode = e.target.get('node');
        var dragNode = e.drag.get('node');
        
        if (dropNode.hasClass('enough') && dropNode.hasClass('condition-list')) {
            dropNode.LAGVEInsert(dragNode);
        }
        
        LAGVE.Condition.tryInsertComparisonChild(dropNode,dragNode);
    });
    
    Y.DD.DDM.on('drop:hit',function(e) {
        LAGVE.Condition.tryInsertComparisonChild(e.drop.get('node'),e.drag.get('node'));
    });
    
    Y.DD.DDM.on('drag:dropmiss',function(e) {
        LAGVE.Condition._positionChild(e.target.get('node'));
    });



/* STATEMENT */
LAGVEStmt = new Object();
LAGVEStmt.overHandledTimestamp = new Date().getTime();

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
    LAGVEStmt.goingDown    = true;
    LAGVEStmt.lastY        = 0;
    
    /**
     *    LAGVEStmt.newStatement
     *
     *    Creates a new LAG STATEMENT block.
     *  Returns the statement.
     */
    LAGVEStmt.newStatement = function(targetNode) {
    
        //////    STATEMENT BLOCK   ///////
        var statement = Y.Node.create( '<div class="statement selectable statement-container"></div>' );
        
        statement.resize = function(reason) {    
            // "bubble up"
            this.get('parentNode').resize('child statement.resize | ' + reason);
        }
        
        statement._LAGVEName    = 'Statement Block';
        statement.getName       = function() {return this._LAGVEName};
        statement.select        = LAGVE._genericSelect;
        statement.deSelect      = LAGVE._genericDeSelect;
        statement.contextMenuItems = LAGVEContext.items.statementContainer;
        statement.on('contextmenu', LAGVEContext.contextMenuHandler);
        
        /**
         * Function to insert nodes asked to be inserted.
         */
        statement.LAGVEInsert = function(node) {
            if (node.hasClass('statement-list-child')) {
                var newChildContainer = LAGVEStmt._newStatementChildContainer(node)
                statement.LAGVEUL.append(newChildContainer);
                newChildContainer.parentChanged();
                node.resize('statement.LAGVEInsert');
            } else {
                Y.log(node.getName() + ' can not be inserted into ' + statement.getName() + '.');
            }
        }
        
        //////    LIST   ///////
        statement.LAGVEUL = Y.Node.create( '<div class="statement-list"></div>' );
        statement.LAGVEUL.resize = function(reason) { statement.resize(reason) };
        statement.LAGVEUL.plug(
            Y.Plugin.Drop,
            {
                node:   statement.LAGVEUL,
                groups: ['statement-list'],
            }
        );
        statement.append(statement.LAGVEUL);
        
        statement.lockDrops = function() {
            this.LAGVEUL.drop.set('lock', true);
        }
        
        
        statement.unlockDrops = function() {
            this.LAGVEUL.drop.set('lock', false);
        }
        
        statement.toLAG = function() {
            var LAG = '';
            
            statement.LAGVEUL.get('children').each(function() {
                LAG += indentOne(this.toLAG()) + '\r\n';
            });
            
            LAG += '';
            
            return LAG;
        }
        
        statement.empty = function() {
            while ( this.LAGVEUL.hasChildNodes() ) {
                this.LAGVEUL.removeChild(this.LAGVEUL.get('firstChild'));
            }
        }

        
        //////    INSERT/RETURN   ///////
        if (isset(targetNode)) {
            targetNode.LAGVEInsert(statement);
        }
        
        return statement;
    };
    
    LAGVEStmt._newStatementChildContainer = function(child) {
        var childContainer      = Y.Node.create( '<div class="statement-list-child-container"></div>' );
    
        var childContainerDrag  = new Y.DD.Drag({
            node:        childContainer,
            groups:        ['statement-list'],
        });
                                                    
        childContainerDrag.plug(Y.Plugin.DDProxy, { moveOnEnd: false });
        
        var stateContainerDrop = new Y.DD.Drop({
            node:    childContainer,
            groups:    ['statement-list'],
        });
        
        childContainer.parentChanged = function() {
            if (this.get('parentNode')) {
                this.resize = this.get('parentNode').resize;
                this.resize('statement child new parent');
            }
            if (this._oldParent) {
                this._oldParent.resize('statement child old parent.');
            }
            this._oldParent = this.get('parentNode');
        }
        
        childContainer.getName = function() {
            return child.getName();
        }
        
        childContainer.toLAG = function() {
            var LAG = this.get('firstChild').toLAG();
            
            return LAG;
        }
        childContainer.contextMenuItems = LAGVEContext.items.visualElement;
        childContainer.on('contextmenu', LAGVEContext.contextMenuHandler);

        childContainer.append(child);
        childContainer.parentChanged();
        
        return childContainer;
    };
        
    Y.DD.DDM.on('drag:over', function(e) {
        var topOfDropStack = LAGVE.dropStack.peek();
        if (topOfDropStack) {
            //Y.log('Top of stack is ' + topOfDropStack.get('id'));
            
            //Get a reference to out drag and drop nodes
            var dragNode = e.drag.get('node'),
                dropNode = topOfDropStack;
            
            // Optimisation to prevent running through all this code for each containing
            // ancestor statement block ancestor. Each of these will fire the drag:over event 
            // but, using the LAGVE.dropStack, each will insert to the top statement block (correctly)
            // therefore we don't need to do it again for all of them on each move. The timestamp will
            // probably be the same for most if not all events fired for a given move.
            var currentTime = new Date().getTime();
            if (currentTime !== LAGVEStmt.overHandledTimestamp &&
                !dropNode.hasClass('yui-dd-drop-locked')) {
                LAGVEStmt.overHandledTimestamp = currentTime;
                                
                //Are we dropping on a li node?
                if (dropNode.hasClass('statement-list-child-container')) {
                    //Are we going down? (not going up)
                    // then we want to insert below, but not below a placeholder
                    if (LAGVEStmt.goingDown) {
                        var nextSibling = dropNode.get('nextSibling');
                        if (isset(nextSibling)) { 
                            dropNode = nextSibling 
                            dropNode.get('parentNode').insertBefore(dragNode, dropNode);
                        } else {
                            if (!dropNode.contains(dragNode)) {
                                dropNode.get('parentNode').append(dragNode);
                                dragNode.parentChanged();
                            }
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
        var dragNode = e.target.get('node');
        
        dragNode.setStyles({
            opacity:    '.5'
        });
        
        var statement = dragNode.get('firstChild');
        if (statement.hasClass('ifthenelse') || statement.hasClass('while')) {
            statement.lockDrops();
        }
        
        //drag.get('dragNode').set('innerHTML', drag.get('node').get('innerHTML'));
        
        // make dragNode's style match node but at 50% opacity
        /*drag.get('dragNode').setStyles({
            opacity:            '.5',
            borderColor:        drag.get('node').getStyle('borderColor'),
            backgroundColor:    drag.get('node').getStyle('backgroundColor')
        });*/
    });

    Y.DD.DDM.on('drag:end', function(e) {        
        var dragNode = e.target.get('node');

        dragNode.setStyles({
            top: '',
            left: '',
            position: '',
            visibility: '',
            opacity: '1',
            filter: 'alpha(opacity = 100)'
        });
        
        var statement = dragNode.get('firstChild');
        if (statement.hasClass('ifthenelse') || statement.hasClass('while')) {
            statement.unlockDrops();
        }
    });





/* CONTEXT MENU */
LAGVEContext = new Object();

LAGVEContext.menus = {
    deleteElement       : Y.one('#context-menu-delete'),
    insertMenu          : Y.one('#context-menu-insert'),
    insertAttributeMenu : Y.one('#context-menu-insert-attribute'),
    insertValue         : Y.one('#context-menu-value'),
    insertStatementMenu : Y.one('#context-menu-insert-statement'),
    insertConditionMenu : Y.one('#context-menu-insert-condition'),
    insertBoolean       : Y.one('#context-menu-boolean'),
    help                : Y.one('#context-menu-help'),
}

LAGVEContext.items = {
    visualElement: [
        LAGVEContext.menus.deleteElement,
        LAGVEContext.menus.help
    ],
    
    attributeContainer: [
        LAGVEContext.menus.insertMenu,
        LAGVEContext.menus.insertAttributeMenu,
        LAGVEContext.menus.help
    ],
    
    valueContainer: [
        LAGVEContext.menus.insertMenu,
        LAGVEContext.menus.insertAttributeMenu,
        LAGVEContext.menus.insertValue,
        LAGVEContext.menus.insertBoolean,
        LAGVEContext.menus.help
    ],
    
    statementContainer: [
        LAGVEContext.menus.insertMenu,
        LAGVEContext.menus.insertStatementMenu,
        LAGVEContext.menus.help
    ],
    
    conditionContainer: [
        LAGVEContext.menus.insertMenu,
        LAGVEContext.menus.insertConditionMenu,
        LAGVEContext.menus.insertBoolean,
        LAGVEContext.menus.help
    ],
}
    

    LAGVEContext.deleteItem = function() {
        if (confirm('Are you sure you want to delete this ' + LAGVEContext.context.getName() + '?')) {
            var parent = LAGVEContext.context.get('parentNode');
            
            LAGVEContext.context.remove();
            
            parent.resize('context delete');            
        }
    }
    
    LAGVEContext.show = function(contextNode, x, y) {
        LAGVEContext.context = contextNode;
        
        for ( var ii = 0; ii < contextNode.contextMenuItems.length; ii++ ) {
            contextNode.contextMenuItems[ii].addClass('valid-menu');
        }
        
        Y.one('#VE-menu').addClass('valid-menu');
        
        Y.one('#VE-menu').setStyles({
            left: x + 'px',
            top:  y + 'px',
        });
    }
    
    LAGVEContext.hide = function() {    
            Y.all('.valid-menu').removeClass('valid-menu');
    }
        
    LAGVEContext.contextMenuHandler = function(e) {
        LAGVEContext.show(e.currentTarget, e.clientX, e.clientY);        
        e.halt();   
    }
    
    Y.on('click', function(e) {
        // hide when when left click except when
        // a button opening a submenu is clicked
        if ( !e.target.hasClass('yui-menu-label')  && 
             !e.target.hasClass('menu-form-input') ) {
            LAGVEContext.hide();
        }
    });
    

    
/* VISUAL EDITOR */
LAGVE.dropStack = new Array;
LAGVE.oneIndentation = '  ';


    LAGVE._init = function() {
        LAGVE._findMainMenu();
        LAGVE._findAttrMenu();
        
        LAGVE._setupMainMenu();
        LAGVE._setupWorkspace();
        //LAGVE.getHelp();
        
        LAGVE._editorReady();   
    }    
    
    LAGVE._editorReady = function() {
        Y.one('#VE-loading-msg').setStyle('display','none');
        Y.one('#playground').setStyle('visibility','');
        LAGVE.sizeWindow(Y.one('window').get('innerHeight'));
    }
    
    LAGVE._findAttrMenu = function() {
        LAGVE.attrMenu  = Y.one("#LAG-Attr-Menu");
            
        LAGVE.attrMenu.attrMenuLabel = Y.one('#LAG-Attr-menulabel');
    }
    
    LAGVE._findMainMenu = function() {
         LAGVE.mainMenu = Y.one("#VE-menu");
    }
        
    LAGVE._setupMainMenu    = function() {
        LAGVE.mainMenu.plug(
            Y.Plugin.NodeMenuNav, 
            {
                autoSubmenuDisplay:    false,
                mouseOutHideDelay:    999999,
                submenuShowDelay:    0,
                submenuHideDelay:    999999
            });
    }
    
    LAGVE._setupWorkspace   = function() {
        //create initialization
        var initialization = LAGVE._createInitialization();
        LAGVE.select(initialization);
        Y.all('.initialization.VE-workspace').append(initialization);
        
        //create implementation
        Y.all('.implementation.VE-workspace').append(LAGVE._createImplementation());
    }
    
    LAGVE._createInitialization = function() {
        LAGVE.initialization            = Y.Node.create( '<div id="initialization" class="selectable"></div>' );
        LAGVE.initialization.resize     = function( reason ) {
            //Y.log('resize reached Initialization | ' + reason);
        }
        LAGVE.initialization.select     = LAGVE._genericSelect;
        LAGVE.initialization.deSelect   = LAGVE._genericDeSelect;
        LAGVE.initialization.toLAG      = function () {
            var LAG = 'initialization (\r\n' + this.statementBox.toLAG() + ')\r\n\r\n';
            
            return LAG;
        }
        
        var title = Y.Node.create( '<div id="initialization-title">INITIALIZATION</div>' );
        
        LAGVE.initialization.statementBox = LAGVEStmt.newStatement();
        // It'd be ambiguious if Initialization statement
        // block could be selected because it's prettier
        // if Init is selectable and Init's selectedness
        // is passed through to the statement block anyway.
        LAGVE.initialization.statementBox.removeClass('selectable');
        LAGVE.initialization.statementBox.setStyle('minWidth','400px');
        LAGVE.initialization.statementBox.setStyle('minHeight','150px');
        
        LAGVE.initialization.append(title);
        LAGVE.initialization.append(LAGVE.initialization.statementBox);
        
        /**
         *    Pass Initialization's LAGVEInsert to statementBox's
         */
        LAGVE.initialization.LAGVEInsert = function(node) {
            LAGVE.initialization.statementBox.LAGVEInsert(node);
        }
        
        
        LAGVE.initialization.empty      = function() {            
            this.statementBox.empty();
        }
        
        return LAGVE.initialization;
    }
    
    LAGVE._createImplementation = function() {
        LAGVE.implementation            = Y.Node.create( '<div id="implementation" class="selectable"></div>' );
        LAGVE.implementation.resize     = function( reason ) {
            //Y.log('resize reached Implementation | ' + reason);
        };
        LAGVE.implementation.select     = LAGVE._genericSelect;
        LAGVE.implementation.deSelect   = LAGVE._genericDeSelect;
        LAGVE.implementation.toLAG      = function () {
            var LAG = 'implementation (\r\n' + this.statementBox.toLAG() + ')\r\n';
            
            return LAG;
        }
        
        var title = Y.Node.create( '<div id="implementation-title">IMPLEMENTATION</div>' );
        
        LAGVE.implementation.statementBox = LAGVEStmt.newStatement();
        // It'd be ambiguious if implementation statement
        // block could be selected because it's prettier
        // if Init is selectable and Init's selectedness
        // is passed through to the statement block anyway.
        LAGVE.implementation.statementBox.removeClass('selectable');
        LAGVE.implementation.statementBox.setStyle('minWidth','400px');
        LAGVE.implementation.statementBox.setStyle('minHeight','150px');
        
        LAGVE.implementation.append(title);
        LAGVE.implementation.append(LAGVE.implementation.statementBox);
        
        /**
         *    Pass Initialization's LAGVEInsert to statementBox's
         */
        LAGVE.implementation.LAGVEInsert = function(node) {
            LAGVE.implementation.statementBox.LAGVEInsert(node);
        }
        
        
        LAGVE.implementation.empty      = function() {            
            this.statementBox.empty();
        }
        
        return LAGVE.implementation;
    }
    /**
    *    LAGVE.insertNewAttr
    *    
    *    Insert attribute and hide menu automatically
    */
    LAGVE.insertNewAttr = function(attributeLevelsArr, targetNode) {
        LAGVE.Attr.insertNewAttr(attributeLevelsArr, targetNode);
        //LAGVE._hideAttrMenu()
    }
    
    LAGVE.insertNewBoolean = function(value, targetNode) {
        LAGVE.Attr.newBoolean(value, targetNode);
        //LAGVE._hideAttrMenu()
    }
    
    LAGVE._hideAttrMenu = function() {
        LAGVE.attrMenu.addClass('yui-menu-hidden');
        //LAGVE.attrMenu.attrMenuLabel.removeClass('yui-menu-label-menuvisible');
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
        Y.all('.VE-workspace').setStyle('height', (newHeight-200) + 'px');
        //Y.log('LAGVE Window height set to ' + newHeight);
    }
    
    
    // namespace for things relating to conversion from LAG to visual representation
    LAGVE.ToVisual = new Object();
    
    // as tokens are parsed, the visual elements representing them
    // are placed onto this stack so that their children can be inserted
    LAGVE.ToVisual.stack = new Array();
    
    
    // default to false
    // when true, the code parsed by the LAG parser in CodeMirror will
    // be converted to the visual representation
    LAGVE.ToVisual.converting = false;
    
    // the last editor onChange timestamp converted to visual representation
    LAGVE.ToVisual.lastEditorChange = 0;
    
    LAGVE.ToVisual.convertIfCodeChanged = function(editorChangeTimestamp) {
        if ( editorChangeTimestamp > LAGVE.ToVisual.lastEditorChange ) {
            LAGVE.ToVisual.convert();
        }
    }
    
    LAGVE.ToVisual.convert = function() {
        LAGVE.ToVisual.stack = new Array();
        
        // update last code change converted to visual
        LAGVE.ToVisual.lastEditorChange = editorChangeTimestamp;
        
        // allow conversion - unset by implementation handler
        LAGVE.ToVisual.converting = true;
        
        Y.one('#updating-visual-message').setStyle('display', 'block');
        
        // Make it really, really unlikely that parsing will pause and restart
        // to try and ensure a single full pass. Stopping and starting means
        // reparsing a line which is bad when converting to visual because the 
        // visual element on top of the stack doesn't make sense to the 
        // visual conversion code if we reparse a line.
        editor.mirror.options.passDelay = 0;
        editor.mirror.options.linesPerPass = 10000;
        
        // hackedly force full parse by copying
        // and replacing all the code in the editor.
        var code = editor.mirror.getCode();
        editor.mirror.setCode(code);
    }
    
                /*if ( LAGVE.ToVisual.stack.length > 0 &&
                     typeof(LAGVE.ToVisual.stack[LAGVE.ToVisual.stack.length - 1])==='undefined')
                    alert("undefined top of stack");*/    
                    
    // Parser action stack functions to build visual elements
    LAGVE.ToVisual.actions = new Object();

    LAGVE.ToVisual.actions.startInitialization = function startInitialization() {
        if (LAGVE.ToVisual.converting) {
            // initialization always exists so don't create it. 
            // Just find it and put it on the stack so we can 
            // insert its contents
            LAGVE.ToVisual.stack.push(LAGVE.initialization);
            // init should now be at top of stack. We're ready 
            // to insert its contents so empty it.
            LAGVE.ToVisual.stack.peek().empty();
        }
    }

    LAGVE.ToVisual.actions.finishInitialization = function finishInitialization() {
        if (LAGVE.ToVisual.converting) {
            LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.startImplementation = function startImplementation() {
        if (LAGVE.ToVisual.converting) {
            // implementation always exists so don't create it. 
            // Just find it and put it on the stack so we can 
            // insert its contents
            LAGVE.ToVisual.stack.push(LAGVE.implementation);
            // init should now be at top of stack. We're ready 
            // to insert its contents so empty it.
            LAGVE.ToVisual.stack.peek().empty();
        }
    }

    LAGVE.ToVisual.actions.finishImplementation = function finishImplementation() {
        if (LAGVE.ToVisual.converting) {
            LAGVE.ToVisual.stack.pop();
            // We're not adding anything after implementation so
            // stop trying to convert things to visual until 
            // told otherwise
            LAGVE.ToVisual.converting = false;

            Y.one('#updating-visual-message').setStyle('display', '');
            
            // revert to defaults
            editor.mirror.options.passDelay = 200;
            editor.mirror.options.linesPerPass = 20;
        }
    }

    LAGVE.ToVisual.actions.startCondition = function startCondition() {
        if (LAGVE.ToVisual.converting) {
            // push the condition of the thing at top of stack
            LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().conditionContainer);
        }
    }

    LAGVE.ToVisual.actions.finishCondition = function finishCondition() {
        if (LAGVE.ToVisual.converting) {
            // pop conditionContainer
            LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.startWhile = function startWhile() {
        if (LAGVE.ToVisual.converting) {
            // create new if-then-else
            var newWhile = LAGVE.Elements.newWhile();
            // insert to top of stack
            LAGVE.ToVisual.stack.peek().LAGVEInsert(newWhile);
            // put it at top of stack so we can insert to it
            LAGVE.ToVisual.stack.push(newWhile);
        }
    }

    LAGVE.ToVisual.actions.finishWhile = function finishWhile() {
        if (LAGVE.ToVisual.converting) {
            LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.startIf = function startIf() {
        if (LAGVE.ToVisual.converting) {
            // create new if-then-else
            var newIf = LAGVEIf.newIf();
            // insert to top of stack
            LAGVE.ToVisual.stack.peek().LAGVEInsert(newIf);
            // put it at top of stack so we can insert to it
            LAGVE.ToVisual.stack.push(newIf);
        }
    }

    LAGVE.ToVisual.actions.finishIf = function finishIf() {
        if (LAGVE.ToVisual.converting) {
            LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.startThen = function startThen() {
        if (LAGVE.ToVisual.converting) {
            // push the Then block of the thing at top of stack
            LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().thenStatementBlock);
        }
    }

    LAGVE.ToVisual.actions.finishThen = function finishThen() {
        if (LAGVE.ToVisual.converting) {
            LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.startElse = function startElse() {
        if (LAGVE.ToVisual.converting) {
            // push the Else block of the thing at top of stack
            LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().elseStatementBlock);
        }
    }

    LAGVE.ToVisual.actions.finishElse = function finishElse() {
        if (LAGVE.ToVisual.converting) {
            LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.bool = function(tokenValue) {
        return function bool() {
            if (LAGVE.ToVisual.converting) {
                // target node is whatever's on top of LAGVE.ToVisual.stack
                var newBoolean = LAGVE.Attr.newBoolean(tokenValue, LAGVE.ToVisual.stack.peek());
            }
        }
    }

    LAGVE.ToVisual.actions.startAssignment = function startAssignment() {
        if (LAGVE.ToVisual.converting) {
            // create new assignment
            // target node is whatever's on top of LAGVE.ToVisual.stack
            var newAssignment = LAGVE.Assignment.newAssignment(LAGVE.ToVisual.stack.peek());
            // push new assignment onto LAGVE.ToVisual.stack so we can find it
            LAGVE.ToVisual.stack.push(newAssignment);
            // push new assignment's attribute container onto LAGVE.ToVisual.stack
            // because we're expecting an attribute that we'll want to insert.
            LAGVE.ToVisual.stack.push(newAssignment.attributeContainer);
        }
    }

    LAGVE.ToVisual.actions.operator = function(tokenValue) {
        if (LAGVE.ToVisual.converting) {
            return function operator() {
                // pop the assignment attribute container off of LAGVE.ToVisual.stack
                LAGVE.ToVisual.stack.pop();
                // set the operator of the assignement statement 
                // at the top of LAGVE.ToVisual.stack to the operator token value
                LAGVE.ToVisual.stack.peek().setOperator(tokenValue);
                // push the assignment value container onto LAGVE.ToVisual.stack
                LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().valueContainer);
            }
        }
    }

    LAGVE.ToVisual.actions.finishAssignment = function finishAssignment() {
        if (LAGVE.ToVisual.converting) {
            // pop the value container off
            LAGVE.ToVisual.stack.pop();
            // pop the assignment off
            LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.startAttribute = function startAttribute() {
        if (LAGVE.ToVisual.converting) {
            var target = LAGVE.ToVisual.stack.peek();
            if (target.setValue) {
                target.setValue('');
            } else {
                // Start with empty value - upcoming Model tokens will modify its value
                // target node is whatever's on top of LAGVE.ToVisual.stack
                var newAttribute = LAGVE.Attr.insertNewAttr('', target);
                // push the new Attribute to the 
                LAGVE.ToVisual.stack.push(newAttribute);
            }
        }
    }

    LAGVE.ToVisual.actions.finishAttribute = function finishAttribute() {
        if (LAGVE.ToVisual.converting) {
            // finished the attribute (not adding anything more to it)
            // so pop it off.
            // Check whether the top of stack really is an attribute box
            // because things like Enough take the value token but don't build an
            // attribute/value visual element for it.
            if (LAGVE.ToVisual.stack.peek().hasClass('attr_box'))
                LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.model = function(tokenValue) {
        if (LAGVE.ToVisual.converting) {
            return function model() {
                // get value of attribute on top of LAGVE.ToVisual.stack
                var currentValue = LAGVE.ToVisual.stack.peek().getValue();
                // don't prepend a '.' to the first Model
                var newValue = ((currentValue === '') ? '' : currentValue + '.') + tokenValue;
                // update value
                LAGVE.ToVisual.stack.peek().setValue(newValue);
            }
        }
    }

    LAGVE.ToVisual.actions.startEnough = function startEnough() {
        if (LAGVE.ToVisual.converting) {
            // make a new Enough
            var newEnough = LAGVE.Condition.newEnough();
            // insert to the thing at the top of LAGVE.ToVisual.stack
            LAGVE.ToVisual.stack.peek().LAGVEInsert(newEnough);
            // push onto LAGVE.ToVisual.stack
            LAGVE.ToVisual.stack.push(newEnough.getCondition());
        }
    }

    LAGVE.ToVisual.actions.startEnoughThreshold = function startEnoughThreshold() {
        if (LAGVE.ToVisual.converting) {
            // Get the new Enough from the top of LAGVE.ToVisual.stack,
            // get its threshold container and push that 
            // to LAGVE.ToVisual.stack.
            LAGVE.ToVisual.stack.push(
                LAGVE.ToVisual.stack.peek().getThreshold()
            );
        }
    }

    LAGVE.ToVisual.actions.finishEnoughThreshold = function finishEnoughThreshold() {
        if (LAGVE.ToVisual.converting) {
            LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.finishEnough = function finishEnough() {
        if (LAGVE.ToVisual.converting) {
            LAGVE.ToVisual.stack.pop();
        }
    }

    LAGVE.ToVisual.actions.startComparison = function startComparison() {
        if (LAGVE.ToVisual.converting) {
            // create new comparison target node is whatever's on top of LAGVE.ToVisual.stack.
            // getCondition() at the end because conditions except booleans 
            // are currently wrapped in a conditionWrapper.
            var newComparison = LAGVE.Condition.newComparison(LAGVE.ToVisual.stack.peek()).getCondition();
            // push new assignment onto LAGVE.ToVisual.stack so we can find it
            LAGVE.ToVisual.stack.push(newComparison);
            // push new assignment's comparison container onto LAGVE.ToVisual.stack
            // because we're expecting an comparison that we'll want to insert.
            LAGVE.ToVisual.stack.push(newComparison.attributeContainer);
        }
    }

    LAGVE.ToVisual.actions.comparator = function(tokenValue) {
        return function comparator() {
            if (LAGVE.ToVisual.converting) {
                // pop the comparison attribute container off of LAGVE.ToVisual.stack
                LAGVE.ToVisual.stack.pop();
                // set the comparator of the comparison 
                // at the top of LAGVE.ToVisual.stack to the comparator token value
                LAGVE.ToVisual.stack.peek().setComparator(tokenValue);
                // push the assignment value container onto LAGVE.ToVisual.stack
                LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().valueContainer);
            }
        }
    }

    LAGVE.ToVisual.actions.finishComparison = function finishComparison() {
        if (LAGVE.ToVisual.converting) {
            // pop the value container off
            LAGVE.ToVisual.stack.pop();
            // pop the comparison off
            LAGVE.ToVisual.stack.pop();
        }
    }

    for (var action in LAGVE.ToVisual.actions) {
        LAGVE.ToVisual.actions[action].visual = true;
    }
    
    // Subscribe to event "io:complete", and pass an array
    // as an argument to the event handler "complete", since
    // "complete" is global.   At this point in the transaction
    // lifecycle, success or failure is not yet known.
    Y.on('io:complete', LAGVE.getHelpComplete);
    
    Y.on('contentready', LAGVE._init, 'body');
    
    Y.on('click', function(e){
        if (e.button === 1) {
            LAGVE.select(e.target);
        }
    });
    
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

