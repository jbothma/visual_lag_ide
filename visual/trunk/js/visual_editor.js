
LAGVE = new Object();

LAGVE.strategyTemplate = '// DESCRIPTION\n//\n//\n\n// VARS\n//\n//\n\ninitialization (\n\n)\n\nimplementation (\n\n)';

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
            "L" + (tipX+4) + " " + (tipY+10) + // draw first line
            "L" + (tipX-4) + " " + (tipY+10) + // draw second line
            "Z";                                // close path
        var head = this.path(pathData);
        head.attr("fill", "black");
        
        if (angle)
            head.rotate(angle, tipX, tipY);
            
        return head;
    },
    /**
    *   paper.PEAL.rhombus(top, left)
    *
    *   Draw a rhombus of width 3 and height 3.
    *
    *   Use PEAL.scaleRhombus() to scale to required size.
    */
    rhombus: function(top, left) {
        var rhombus = this.path('M 0 1 L 1 0 L 2 1 L 1 2 Z');
        
        rhombus.translate(top, left);
        
        return rhombus;
    },
    scaleRhombus: function( rhombus, width, height ) {
        // adjust for the fact that the initial rhombus isn't really unit width.
        // If we dont adjust, we end up with a rhombus twice as wide as width etc.
        width = width/2;
        height = height/2;
        
        // store starting position
        var bBox = rhombus.getBBox();
        var left = Math.floor(bBox.x);
        var top  = Math.floor(bBox.y);
        
        rhombus.scale(width, height);
        rhombus.translate(width, height);
        
        // return to origin
        var bBox = rhombus.getBBox();
        rhombus.translate( -bBox.x, -bBox.y );
        
        // return to starting position
        rhombus.translate( left, top );
    },        
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
        
        LAGVEContext.applyContextMenu(
            newAttribute, 
            LAGVEContext.items.visualElement
        )
        
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
        
        LAGVEContext.applyContextMenu(
            assignment.attributeContainer, 
            LAGVEContext.items.attributeContainer
        )

        
        
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
        
        LAGVEContext.applyContextMenu(
            assignment.valueContainer, 
            LAGVEContext.items.valueContainer
        )
        
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
        
        ifThenElse.resize = function(reason) {        
            if ( !this.ancestor('.tabview-hidden') ) {
                // Setup //
                
                var conditionContainerWidth  = parseInt(this.conditionContainer.getComputedStyle('width'));
                var conditionContainerHeight = parseInt(this.conditionContainer.getComputedStyle('height'));
                
                var thenWidth  = parseInt(this.thenStatementList.getComputedStyle('width'));                                    
                var elseWidth  = parseInt(this.elseStatementList.getComputedStyle('width'));
                
                var thenHeight = parseInt(this.thenStatementList.getComputedStyle('height'));                                    
                var elseHeight = parseInt(this.elseStatementList.getComputedStyle('height'));                                    
                
                
                // Compute //
                
                var rhombusWidth    = conditionContainerWidth * 2;
                var rhombusHeight   = conditionContainerHeight * 2;
                
                var conditionContainerLeft = conditionContainerWidth/2;
                var conditionContainerTop  = conditionContainerHeight/2;
                
                var thenLeft = rhombusWidth + 80;
                var elseLeft = rhombusWidth + 80;
                
                var thenTop = rhombusHeight / 2 - 10;
                var elseTop = thenTop + thenHeight + 10;
                
                var ifThenElseWidth  = Math.max( (thenLeft + thenWidth), (elseLeft + elseWidth) ) + 10;
                var ifThenElseHeight = Math.max( (elseTop + elseHeight), (rhombusHeight) ) + 10;
                
                
                // Output //

                this.conditionContainer.setStyle('left', conditionContainerLeft + 'px');
                this.conditionContainer.setStyle('top', conditionContainerTop + 'px');

                this.raphael.PEAL.scaleRhombus( this.SVGRhombus, rhombusWidth, rhombusHeight );
                
                if (this.thenArrowHead) this.thenArrowHead.remove();
                if (this.elseArrowHead) this.elseArrowHead.remove();
                this.thenArrowHead = this.raphael.PEAL.arrowhead(thenLeft, thenTop + 10, 90);
                this.elseArrowHead = this.raphael.PEAL.arrowhead(elseLeft, elseTop + 10, 90);
                
                if (this.thenArrowStroke) this.thenArrowStroke.remove();
                if (this.elseArrowStroke) this.elseArrowStroke.remove();
                
                this.thenArrowStroke = this.raphael.path(
                    'M' + rhombusWidth + ',' + (thenTop + 10) + // start at RHS corner of rhombus
                    'L' + thenLeft + ',' + (thenTop + 10)       // Horizontal line to LHS edge of thenStatementList
                );
                
                this.elseArrowStroke = this.raphael.path(
                    'M' + (rhombusWidth / 2) + ',' + rhombusHeight +    // start at bottom corner of rhombus
                    'L' + (rhombusWidth / 2) + ',' + (elseTop + 10) +   // Vertical line until level with elseArrowHead
                    'L' + elseLeft + ',' + (elseTop + 10)               // Horizontal line to LHS edge of elseStatementList
                );
                
                if (this.ifLabel)   this.ifLabel.remove();
                if (this.elseLabel) this.thenLabel.remove();
                if (this.elseLabel) this.elseLabel.remove();
                
                // catch exception from BUG 552549 in FF 3.6
                try {
                    this.ifLabel   = this.raphael.text( (conditionContainerWidth + 3), 10, 'IF');
                    this.thenLabel = this.raphael.text( (thenLeft - 50), thenTop, 'THEN');
                    this.elseLabel = this.raphael.text( (elseLeft - 50), elseTop, 'ELSE');
                } catch(ex) {}
                
                this.thenStatementList.setStyles({ 
                    top:    thenTop + 'px', 
                    left:   thenLeft + 'px',
                });
                
                this.elseStatementList.setStyles({ 
                    top:    elseTop + 'px', 
                    left:   elseLeft + 'px',
                });
                
                // SVG canvas width
                this.raphael.setSize( ifThenElseWidth, ifThenElseHeight );

                // entire visual element width
                this.setStyles({ 
                    width:  ifThenElseWidth + 'px', 
                    height: ifThenElseHeight + 'px',
                });
            }
            
            
            // Bubble
            this.get('parentNode').resize('ifThenElse.resize | ' + reason);
        };
        
        
        /////// SVG canvas ////////
        ifThenElse.raphael = Raphael( Y.Node.getDOMNode(ifThenElse), 1, 1 );
        ifThenElse.canvas = Y.one( ifThenElse.raphael.canvas );
        
        ifThenElse.canvas.setStyles({
            position:   'absolute',
            top:        '0px',
            left:       '0px',
        });


        ///////    IF    ////////

        ifThenElse.SVGRhombus = ifThenElse.raphael.PEAL.rhombus(0,0);
        ifThenElse.SVGRhombus.attr("fill", "white");

        ifThenElse.conditionContainer = Y.Node.create('\
            <div class="ifthenelse condition-container"></div>\
        ');
        ifThenElse.conditionContainer.plug(
            Y.Plugin.Drop,
            {
                groups:    ['condition'],
            }
        );        
        ifThenElse.conditionContainer.resize = function(reason) {
            ifThenElse.resize('ifThenElse.conditionContainer.resize | ' + reason);
        };
        ifThenElse.conditionContainer.LAGVEInsert = function(child) {
            if (child.hasClass('condition')) {
                if (!this.hasChildNodes()) {            
                    this.append(child);
                    child.parentChanged();
                    child.resize('ifThenElse.conditionContainer.LAGVEInsert');
                }
            }
        }
                
        LAGVEContext.applyContextMenu(
            ifThenElse.conditionContainer,
            LAGVEContext.items.conditionContainer
        );
                

        ///////    THEN    ////////
        ifThenElse.thenStatementList = LAGVEStmt.newStatementList();
        ifThenElse.thenStatementList.addClass('ifthenelse');
        
        
        ///////    ELSE    ////////
        ifThenElse.elseStatementList = LAGVEStmt.newStatementList();
        ifThenElse.elseStatementList.addClass('ifthenelse');
                
        /*    Node structure:
            
        ifThenElse
            raphaeljs canvas
            conditionContainer
            thenStatementList
            elseStatementList
        */
        ifThenElse.append( ifThenElse.conditionContainer );
        ifThenElse.append( ifThenElse.thenStatementList );
        ifThenElse.append( ifThenElse.elseStatementList ); 

        

        ifThenElse.toLAG = function() {
            var LAG = 
                'if ' + ifThenElse.conditionContainer.toLAG() + ' then (\r\n' + 
                ifThenElse.thenStatementList.toLAG() + ')';
                
            // Else is optional
            var elseLAG = ifThenElse.elseStatementList.toLAG();
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
        
        ifThenElse.lockDrops = function() {
            this.elseStatementList.lockDrops();
            this.thenStatementList.lockDrops();
        }
        
        ifThenElse.unlockDrops = function() {
            this.elseStatementList.unlockDrops();
            this.thenStatementList.unlockDrops();
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
        
        /////// SVG canvas ////////
        newWhile.raphael = Raphael( Y.Node.getDOMNode(newWhile), 1, 1 );
        newWhile.canvas = Y.one( newWhile.raphael.canvas );
        
        newWhile.canvas.setStyles({
            position:   'absolute',
            top:        '0px',
            left:       '0px',
        });
        
        newWhile.SVGRhombus = newWhile.raphael.PEAL.rhombus(80, 20);
        newWhile.SVGRhombus.attr("fill", "white");      
        
        // .while.multiple-documents-symbol
        newWhile.multiDocsSymbol = Y.Node.create(
            '<div class="while multiple-documents-symbol">\
                <img alt="multiple-documents-symbol" \
                     class="while multiple-documents-symbol" \
                     src="images/multiple_documents.png">\
                <span class="while multiple-documents-symbol">For each concept in the lesson</span>\
            </div>'
        );
        
        // .while.condition-container
        newWhile.conditionContainer   = Y.Node.create(
            '<div class="while condition-container"></div>');
                    
        // .while.statement
        newWhile.statementList = LAGVEStmt.newStatementList();
        newWhile.statementList.addClass('while');
        
        newWhile.conditionContainer.plug(
            Y.Plugin.Drop,
            {
                groups:    ['condition'],
            }
        );
        
        /*
            HTML elements in this order to overlap correctly.
            while
                multiDocsSymbol
                raphaeljs canvas
                    arrowlineMultidocsToRhombus
                    arrowlineRhombusStatementsMultidocs
                    arrowheadIntoMultidocs
                    arrowheadIntoRhombus
                    arrowheadIntoStatem
                statementListents
                conditionContainer
        */
        
        newWhile.append( newWhile.statementList );
        newWhile.append( newWhile.conditionContainer );
        newWhile.insertBefore( newWhile.multiDocsSymbol, newWhile.canvas);
        
        newWhile.lockDrops = function() {
            this.statementList.lockDrops();
        }
        
        newWhile.unlockDrops = function() {
            this.statementList.unlockDrops();
        }
                
        newWhile._LAGVEName   = 'For Each Concept';
        newWhile.getName      = function() { return this._LAGVEName; }
        
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
        
        
        LAGVEContext.applyContextMenu(
            newWhile.conditionContainer, 
            LAGVEContext.items.conditionContainer
        )
        
        newWhile.conditionContainer.toLAG = function() {
            if (this.hasChildNodes()) {
                return this.get('firstChild').toLAG();
            }
            return '';
        }
        newWhile.toLAG = function() {
            return 'while ' + this.conditionContainer.toLAG() + ' (\n' + this.statementList.toLAG() + ')\n';
        };
        
        newWhile.resize = function() {
            if ( !this.ancestor('.tabview-hidden') ) {
                // Setup //
                
                var conditionContainerWidth  = parseInt(this.conditionContainer.getComputedStyle('width'));
                var conditionContainerHeight = parseInt(this.conditionContainer.getComputedStyle('height'));
                
                var statementListHeight = parseInt(this.statementList.getComputedStyle('height'));
                var statementListWidth = parseInt(this.statementList.getComputedStyle('width'));
                
                // Calculations //
                
                var rhombusHeight        = conditionContainerHeight * 2;
                var rhombusWidth         = conditionContainerWidth * 2;
                            
                var conditionContainerLeft   = 80 + rhombusWidth/4;
                var conditionContainerTop    = 20 + rhombusHeight/4;
                
                // just below and to the right of the rhombus
                var statementListTop    = 20 + 5 + rhombusHeight * 0.75;            
                var statementListLeft   = 80 + 5 + rhombusWidth * 0.75;
                
                var multiDocsSymbTop = 20 + (rhombusHeight / 2);
                
                var arrowRhombusToStatementListStartLeft    = (80 + rhombusWidth);
                var arrowRhombusToStatementListStartTop     = (20 + rhombusHeight/2);
                var arrowRhombusToStatementListEndLeft      = (statementListLeft + statementListWidth/2);
                
                var arrowMultidocsToRhombusEndLeft          = (80 + (rhombusWidth / 2));
                
                var arrowStatementListToMultiDocsEndTop = (multiDocsSymbTop + 66);
                var arrowStatementListToMultiDocsStartTop = Math.max( arrowStatementListToMultiDocsEndTop, (20 + rhombusHeight) ) + 10;
                
                // this (the 'while' visual element container)
                // statementListTop + statementList height
                var whileHeight = statementListTop + statementListHeight + 5;
                var whileWidth = statementListLeft + statementListWidth + 5;
                
                
                // Output //
                
                this.raphael.PEAL.scaleRhombus( this.SVGRhombus, rhombusWidth, rhombusHeight );
                this.SVGRhombus.toFront();
                
                this.conditionContainer.setStyle('left', conditionContainerLeft + 'px');
                this.conditionContainer.setStyle('top', conditionContainerTop + 'px');
                
                this.multiDocsSymbol.setStyle('top', multiDocsSymbTop + 'px');
                
                this.statementList.setStyle('top', statementListTop + 'px');
                this.statementList.setStyle('left', statementListLeft + 'px');
                
                        
                // arrow from multiDocs to Condition
                
                if (this.arrowLineMultidocsToRhombus) this.arrowLineMultidocsToRhombus.remove();
                if (this.arrowHeadMultidocsToRhombus) this.arrowHeadMultidocsToRhombus.remove();
                
                this.arrowLineMultidocsToRhombus = newWhile.raphael.path(
                    'M 65 ' + multiDocsSymbTop + ' C' +     // start curve at top middle of multidocs
                    '65 5,' +                               // first control point
                    arrowMultidocsToRhombusEndLeft + ' -12,' +   // second control point
                    arrowMultidocsToRhombusEndLeft + ' ' + 20   // end curve at at top middle of rhombus
                );
                
                // get the angle of the arrow in the middle of the arrowhead
                //   (here arrowhead is assumed to be 10)
                var pathLengthAtHeadBase = ( this.arrowLineMultidocsToRhombus.getTotalLength() - 5 );
                // not sure why but needs 90 degree offset
                var headAngle = this.arrowLineMultidocsToRhombus.getPointAtLength( pathLengthAtHeadBase ).alpha - 90;
                
                this.arrowHeadMultidocsToRhombus = this.raphael.PEAL.arrowhead(arrowMultidocsToRhombusEndLeft, 20, headAngle);
                
                
                // arrow from condition to statementList
                
                if (this.arrowLineRhombusToStatementList) this.arrowLineRhombusToStatementList.remove();
                if (this.arrowHeadRhombusToStatementList) this.arrowHeadRhombusToStatementList.remove();
                
                var pathData = 
                    // start curve at right middle corner of rhombus
                    'M ' + arrowRhombusToStatementListStartLeft + ' ' + 
                    arrowRhombusToStatementListStartTop + 
                    // first control point
                    ' C' + arrowRhombusToStatementListEndLeft + ' ' + 
                    arrowRhombusToStatementListStartTop + ',' +
                    // second control point
                    arrowRhombusToStatementListEndLeft + ' ' + 
                    arrowRhombusToStatementListStartTop + ',' +
                    // end curve at at top middle of statementList
                    arrowRhombusToStatementListEndLeft + ' ' + 
                    statementListTop
                this.arrowLineRhombusToStatementList = newWhile.raphael.path( pathData );

                this.arrowHeadRhombusToStatementList = this.raphael.PEAL.arrowhead(
                    arrowRhombusToStatementListEndLeft, 
                    statementListTop, 
                    180
                );
                
                
                // arrow from statementList to multidocs
                
                if (this.arrowLineStatementListToMultiDocs) this.arrowLineStatementListToMultiDocs.remove();
                if (this.arrowHeadStatementListToMultiDocs) this.arrowHeadStatementListToMultiDocs.remove();
                
                this.arrowLineStatementListToMultiDocs = newWhile.raphael.path(
                    'M' + statementListLeft + ' ' + arrowStatementListToMultiDocsStartTop + ' C' + // start curve at top middle of multidocs
                    36 + ' ' + arrowStatementListToMultiDocsStartTop + ' ' + // first control point
                    36 + ' ' + arrowStatementListToMultiDocsStartTop + ' ' +   // second control point
                    36 + ' ' +  arrowStatementListToMultiDocsEndTop  // end curve at at top middle of rhombus
                );
                
                // get the angle of the arrow in the middle of the arrowhead
                //   (here arrowhead is assumed to be 10)
                var pathLengthAtHeadBase = ( this.arrowLineStatementListToMultiDocs.getTotalLength() - 5 );
                // not sure why but needs 90 degree offset
                var headAngle = this.arrowLineStatementListToMultiDocs.getPointAtLength( pathLengthAtHeadBase ).alpha + 90;
                
                this.arrowHeadStatementListToMultiDocs = this.raphael.PEAL.arrowhead(
                    36, 
                    arrowStatementListToMultiDocsEndTop, 
                    headAngle
                );
                
                
                // SVG canvas width
                this.raphael.setSize( whileWidth, whileHeight );
                
                this.setStyle('height', whileHeight + 'px');
                this.setStyle('width', whileWidth + 'px');
            }
        }
        
        newWhile.conditionContainer.resize = function(reason) {
            newWhile.resize('while.conditionContainer.resize | ' + reason);
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

        LAGVEContext.applyContextMenu(
            conditionWrapper, 
            LAGVEContext.items.visualElement
        )
    
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
            
            //NEVER call parent's resize(), it's this' container that calls this to resize.
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
        
        LAGVEContext.applyContextMenu(
            comparison.attributeContainer, 
            LAGVEContext.items.attributeContainer
        )
        
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

        LAGVEContext.applyContextMenu(
            comparison.valueContainer, 
            LAGVEContext.items.valueContainer
        )
        
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
            <div class="enough primary selectable">ENOUGH&nbsp;</div>\
        ');
        
        enough._LAGVEName = 'Enough';
 
        enough.getName       = function() {
            return this._LAGVEName;
        }
        
        enough.toLAG = function() {
            var LAG = 'enough(';
            
            this.conditionList.get('children').each(function() {
                LAG += this.toLAG() + '\n';
            });
            
            LAG += ',' + this.threshold.getValue() + ')';
            
            return LAG;
        }
 
        enough._resize = function() {
            // Setup
            var conditionListWidth = parseInt(this.conditionList.getComputedStyle('width'));
            var conditionListHeight = parseInt(this.conditionList.getComputedStyle('height'));
            
            // Output
            this.setStyle('width', conditionListWidth + 10 + 'px');
            this.setStyle('height', conditionListHeight + 40 + 'px');
        }
        
        enough.resize = function( reason){
            this._resize('comparison.resize');
            
            this.get('parentNode').resize('enough.resize');
        }
        
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
        
        enough.getThreshold = function() { 
            return this.threshold;
        }
        
        enough.threshold = Y.Node.create('\
            <input type="text" class="enough threshold" value="0">\
        ');
        
        enough.append(enough.threshold);
        
        enough.threshold.setValue = function(newValue) {
            this.set('value', newValue);
        }
        enough.threshold.getValue = function() {
            return this.get('value');
        }
        
        enough.conditionList = Y.Node.create('\
            <div class="enough condition-list selectable"></div>\
        ')
        enough.conditionList.plug(
            Y.Plugin.Drop,
            {
                groups:    ['condition'],
            }
        )     
        enough.conditionList.resize        = function() {
            enough.resize();
        }
        enough.conditionList.select        = LAGVE._genericSelect;
        enough.conditionList.deSelect      = LAGVE._genericDeSelect;
        
        enough.conditionContainer = enough.conditionList;
        
        LAGVEContext.applyContextMenu(
            enough.conditionContainer, 
            LAGVEContext.items.conditionContainer
        )

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
     *  LAGVEStmt.newStatementList
     *
     *  reates a new LAG STATEMENT list.
     *  Returns the statement list.
     */
    LAGVEStmt.newStatementList = function(targetNode) {
    
        //////    STATEMENT LIST   ///////
        var statementList = Y.Node.create( '<div class="statement-list selectable statement-container"></div>' );
        
        statementList.resize = function(reason) {    
            // "bubble up"
            this.get('parentNode').resize('child statement-list.resize | ' + reason);
        }
        
        statementList._LAGVEName    = 'Statement List';
        statementList.getName       = function() {return this._LAGVEName};
        statementList.select        = LAGVE._genericSelect;
        statementList.deSelect      = LAGVE._genericDeSelect;
        
        LAGVEContext.applyContextMenu(
            statementList, 
            LAGVEContext.items.statementContainer
        )
        
        /**
         * Function to insert nodes asked to be inserted.
         */
        statementList.LAGVEInsert = function(node) {
            if (node.hasClass('statement-list-child')) {
                var newChildContainer = LAGVEStmt._newStatementChildContainer(node)
                statementList.append(newChildContainer);
                newChildContainer.parentChanged();
                node.resize('statementList.LAGVEInsert');
            } else {
                Y.log(node.getName() + ' can not be inserted into ' + statementList.getName() + '.');
            }
        }
        
        //////    LIST   ///////
        statementList.plug(
            Y.Plugin.Drop,
            {
                groups: ['statement-list'],
            }
        );
        
        statementList.lockDrops = function() {
            this.drop.set('lock', true);
        }
        
        
        statementList.unlockDrops = function() {
            this.drop.set('lock', false);
        }
        
        statementList.toLAG = function() {
            var LAG = '';
            
            statementList.get('children').each(function() {
                LAG += this.toLAG() + '\r\n';
            });
            
            LAG += '';
            
            return LAG;
        }
        
        statementList.empty = function() {
            while ( this.hasChildNodes() ) {
                this.removeChild(this.get('firstChild'));
            }
        }

        
        //////    INSERT/RETURN   ///////
        if (isset(targetNode)) {
            targetNode.LAGVEInsert(statementList);
        }
        
        return statementList;
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
        
        LAGVEContext.applyContextMenu(
            childContainer, 
            LAGVEContext.items.visualElement
        )

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
            // ancestor statement list ancestor. Each of these will fire the drag:over event 
            // but, using the LAGVE.dropStack, each will insert to the top statement list (correctly)
            // therefore we don't need to do it again for all of them on each move. The timestamp will
            // probably be the same for most if not all events fired for a given move.
            var currentTime = new Date().getTime();
            if (currentTime !== LAGVEStmt.overHandledTimestamp) {
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

    Y.DD.DDM.on('ddm:start', function(e) {
        
        var statement = this.activeDrag.get('node').get('firstChild');
        
        if ( statement.hasClass('ifthenelse') || statement.hasClass('while') ) {
            statement.lockDrops();
        }
    });
    
    Y.DD.DDM.on('drag:start', function(e) {
        e.target.get('node').setStyles({
            opacity:    '.5'
        });
        
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
        
    LAGVEContext.applyContextMenu = function ( contextNode, contextMenuItems ) {
        // Mark the relevant context menu items on the node
        contextNode.contextMenuItems = contextMenuItems;
        
        // register an event handler for the context menu on the node
        contextNode.on('contextmenu', LAGVEContext.contextMenuHandler);
        
        // Add CSS class to the node that has a context menu so that 
        // we can do CSS style stuff with it.
        contextNode.addClass('context-menu-node');
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
        //LAGVE.select(initialization);
        Y.all('.initialization.VE-workspace').append(initialization);
        
        //create implementation
        var implementation = LAGVE._createImplementation();
        Y.all('.implementation.VE-workspace').append(implementation);
        implementation.resize();
    }
    
    LAGVE._createInitialization = function() {
        LAGVE.initialization            = Y.Node.create( '<div id="initialization" class="selectable"></div>' );
        LAGVE.initialization.resize     = function( reason ) {
            //Y.log('resize reached Initialization | ' + reason);
        }
        LAGVE.initialization.select     = LAGVE._genericSelect;
        LAGVE.initialization.deSelect   = LAGVE._genericDeSelect;
        LAGVE.initialization.toLAG      = function () {
            var LAG = 'initialization (\r\n' + this.statementList.toLAG() + ')\r\n\r\n';
            
            return LAG;
        }
        
        var title = Y.Node.create( '<div id="initialization-title">INITIALIZATION</div>' );
        
        LAGVE.initialization.statementList = LAGVEStmt.newStatementList();
        // It'd be ambiguious if Initialization statement
        // block could be selected because it's prettier
        // if Init is selectable and Init's selectedness
        // is passed through to the statement block anyway.
        LAGVE.initialization.statementList.removeClass('selectable');
        LAGVE.initialization.statementList.setStyle('minWidth','400px');
        LAGVE.initialization.statementList.setStyle('minHeight','150px');
        
        LAGVE.initialization.append(title);
        LAGVE.initialization.append(LAGVE.initialization.statementList);
        
        /**
         *    Pass Initialization's LAGVEInsert to statementList's
         */
        LAGVE.initialization.LAGVEInsert = function(node) {
            LAGVE.initialization.statementList.LAGVEInsert(node);
        }
        
        
        LAGVE.initialization.empty      = function() {            
            this.statementList.empty();
        }
        
        return LAGVE.initialization;
    }
    
    LAGVE._createImplementation = function() {
        LAGVE.implementation = Y.Node.create( '<div id="implementation" class="selectable"></div>' );
        
        // .implementation.multiple-documents-symbol
        LAGVE.implementation.multiDocsSymbol = Y.Node.create(
            '<div class="implementation multiple-documents-symbol">\
                <img alt="multiple-documents-symbol" \
                     class="implementation multiple-documents-symbol" \
                     src="images/multiple_documents.png">\
                <span class="implementation multiple-documents-symbol">For each concept in the lesson</span>\
            </div>');
            
        /////// SVG canvas ////////
        LAGVE.implementation.raphael = Raphael( Y.Node.getDOMNode(LAGVE.implementation), 1, 1 );
        LAGVE.implementation.canvas = Y.one( LAGVE.implementation.raphael.canvas );
        
        LAGVE.implementation.canvas.setStyles({
            position:   'absolute',
            top:        '0px',
            left:       '0px',
        });
        
        // "User access a Concept"
        try { LAGVE.implementation.raphael.text(81, 20, 'User accesses\na Concept'); } catch(ex) {} // catch exception from BUG 552549 in FF 3.6
        LAGVE.implementation.raphael.rect(20, 5, 120, 32, 16);
        
        // Arrow from Start State to MultiDocs        
        LAGVE.implementation.raphael.path('M 81 37 L 81 65');
        LAGVE.implementation.raphael.PEAL.arrowhead(81, 65, 180);
        
        // Arrow from multidocs to statementList
        LAGVE.implementation.raphael.path('M 132 85 L 180 85');
        LAGVE.implementation.raphael.PEAL.arrowhead(180, 85, 90);
        
        // Arrow from statementList to multidocs
        LAGVE.implementation.raphael.path('M 180 100 L 132 100');
        LAGVE.implementation.raphael.PEAL.arrowhead(132, 100, 270);
        
        LAGVE.implementation.resize = function( reason ) {            
            // Setup
            var statementListWidth = 
                parseInt(this.statementList.getComputedStyle('width')) || 
                parseInt(this.statementList.getStyle('minWidth'));          // make sure some size gotten before it's drawn
            var statementListHeight = 
                parseInt(this.statementList.getComputedStyle('height')) || 
                parseInt(this.statementList.getStyle('minHeight'));         // make sure some size gotten before it's drawn
                        
            // Compute
            implementationWidth     = 5 + 180 + statementListWidth + 5;
            implementationHeight    = 5 + statementListHeight + 5;
            
            // Output
            
            // SVG canvas width
            this.raphael.setSize( implementationWidth, implementationHeight );
                
            this.setStyle('width', implementationWidth + 'px');
            this.setStyle('height', implementationHeight + 'px');
        };
        LAGVE.implementation.select     = LAGVE._genericSelect;
        LAGVE.implementation.deSelect   = LAGVE._genericDeSelect;
        LAGVE.implementation.toLAG      = function () {
            var LAG = 'implementation (\r\n' + this.statementList.toLAG() + ')\r\n';
            
            return LAG;
        }
        
        
        LAGVE.implementation.statementList = LAGVEStmt.newStatementList();
        // It'd be ambiguious if implementation statement
        // block could be selected because it's prettier
        // if Init is selectable and Init's selectedness
        // is passed through to the statement block anyway.
        LAGVE.implementation.statementList.removeClass('selectable');
        LAGVE.implementation.statementList.setStyle('minWidth','400px');
        LAGVE.implementation.statementList.setStyle('minHeight','150px');
        
        LAGVE.implementation.append(LAGVE.implementation.multiDocsSymbol);
        LAGVE.implementation.append(LAGVE.implementation.statementList);
        
        /**
         *    Pass Initialization's LAGVEInsert to statementList's
         */
        LAGVE.implementation.LAGVEInsert = function(node) {
            LAGVE.implementation.statementList.LAGVEInsert(node);
        }
        
        LAGVE.implementation.empty      = function() {            
            this.statementList.empty();
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
        Y.all('.VE-workspace').setStyle('height', (newHeight-130) + 'px');
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
    
    /*LAGVE.ToVisual.convertIfCodeChanged = function(editorChangeTimestamp) {
        if ( editorChangeTimestamp > LAGVE.ToVisual.lastEditorChange ) {
            LAGVE.ToVisual.convert();
        }
    }*/
    
    LAGVE.ToVisual.convert = function() {
        LAGVE.ToVisual.stack = new Array();
        
        // update last code change converted to visual
        //LAGVE.ToVisual.lastEditorChange = editorChangeTimestamp;
        
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
            LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().thenStatementList);
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
            LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().elseStatementList);
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
    
    /*Y.on('click', function(e){
        if (e.button === 1) {
            LAGVE.select(e.target);
        }
    });*/
    
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

