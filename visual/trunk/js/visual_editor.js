
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



LAGVE.Attr = new Object();

YUI({
    //filter:     'raw',
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
                                                                                
        newAttribute.addClass('deletable');
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
        var assignment      = Y.Node.create( '<div class="assignment statement-child"></div>' );
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
        var ifThenElse          = Y.Node.create('<div id=' + Y.guid('ifthenelse-') + ' class="ifthenelse statement-child"></div>');
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
            ifThenElse.conditionPositioning.get('children').filter('.ifthenelse-diamond-image').setStyle('visibility','hidden');
            ifThenElse.conditionPositioning.get('children').filter('.ifthenelse-diamond-image-selected').setStyle('visibility','visible');
        };
        ifThenElse.conditionPositioning.deSelect    = function() {
            ifThenElse.conditionPositioning.get('children').filter('.ifthenelse-diamond-image-selected').setStyle('visibility','hidden');
            ifThenElse.conditionPositioning.get('children').filter('.ifthenelse-diamond-image').setStyle('visibility','visible');
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
        
        
        
        ifThenElse.arrows           = Y.Node.create('<div class="ifthenelse-arrows"></div>');
        ifThenElse.arrowheadLeft    = Y.Node.create('<div class="ifthenelse-arrowhead-left"></div>');
        ifThenElse.arrowheadRight   = Y.Node.create('<div class="ifthenelse-arrowhead-right"></div>');
        ifThenElse.ifDiamondIMG     = Y.Node.create(
            '<img    alt="if-then-else diamond shape" \
            class="ifthenelse-diamond-image" \
            src="images/ifthenelse_diamond.png" ></img>\
        ');    
        ifThenElse.ifDiamondIMGSelected = Y.Node.create(
            '<img    alt="if-then-else diamond shape selected" \
                    class="ifthenelse-diamond-image-selected" \
                    src="images/ifthenelse_diamond_selected.png" >\
            </img>'
        );
        
        ifThenElse.conditionContainer   = Y.Node.create('\
            <div id=' + Y.guid('condition-container-') + ' \
            class="ifthenelse-condition-container"></div>\
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
        ifThenElse.thenStatementBlock.removeClass('deletable');
        ifThenElse.thenStatementBlock.resize = ifThenElse.resize;    // replace statement's resize()
        ifThenElse.thenBlock.append(ifThenElse.thenStatementBlock);
        ifThenElse.thenBlockTitle = Y.Node.create('<div class="ifthenelse-then-title">THEN</div>');
        
        
        ///////    ELSE    ////////
        ifThenElse.elseBlock = Y.Node.create('<div class="ifthenelse-else"></div>');
        ifThenElse.elseStatementBlock = LAGVEStmt.newStatement();
        ifThenElse.elseStatementBlock.addClass('ifthenelse-else-statement');
        ifThenElse.elseStatementBlock.removeClass('deletable');
        ifThenElse.elseStatementBlock.resize = ifThenElse.resize;    // replace statement's resize()
        ifThenElse.elseBlock.append(ifThenElse.elseStatementBlock);
        ifThenElse.elseBlockTitle = Y.Node.create('<div class="ifthenelse-else-title">ELSE</div>');    
                
        /*    Node structure:
            
        ifThenElse
                ifThenElse.conditionPositioning
                    arrows
                        arrowhead left
                        arrowhead right
                    ifDiamondIMG
                    ifDiamondIMGSelected
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
        ifThenElse.conditionPositioning.append( ifThenElse.ifDiamondIMG         );
        ifThenElse.conditionPositioning.append( ifThenElse.ifDiamondIMGSelected );
        ifThenElse.conditionPositioning.append( ifThenElse.conditionContainer   );
        ifThenElse.append(                      ifThenElse.thenAndElse          );
        ifThenElse.thenAndElse.append(          ifThenElse.thenBlock            );
        ifThenElse.thenBlock.append(            ifThenElse.thenBlockTitle       );
        ifThenElse.thenAndElse.append(          ifThenElse.elseBlock            );
        ifThenElse.elseBlock.append(            ifThenElse.elseBlockTitle       );

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
        
        if (isset(targetNode)) {
            targetNode.LAGVEInsert(ifThenElse);
            //ifThenElse.resize('new ifthenelse');
        }
        
        return ifThenElse;
    }
    
    
    Y.DD.DDM.on('drop:enter',function(e) {
        var dropNode = e.target.get('node');
        if (dropNode.hasClass('ifthenelse-condition-container')) {
            dropNode.LAGVEInsert(e.drag.get('node'));
        }
    });

    
/* CONDITION */
LAGVE.Condition = new Object();


    /**
     *    Dragable, reorderable HTML LI
     *    To be called by the function creating a new condition, e.g. a new Comparison
     *    Returns the container LI after inserting the new condition.
     *    Parameters:    condition
     */
    LAGVE.Condition.wrapCondition = function(child) {
        var conditionWrapper = Y.Node.create( '<div class="condition deletable wrapper"></div>' );
    
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
                <option value="&lt;">&lt;</option>\
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
        var statement = Y.Node.create( '<div id=' + Y.guid('statement-') + ' class="statement deletable selectable"></div>' );
        
        statement.resize = function(reason) {    
            // "bubble up"
            this.get('parentNode').resize('child statement.resize | ' + reason);
        }
        
        statement._LAGVEName    = 'Statement Block';
        statement.getName       = function() {return this._LAGVEName};
        statement.select        = LAGVE._genericSelect;
        statement.deSelect      = LAGVE._genericDeSelect;
        
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
                Y.log(node.getName() + ' can not be inserted into ' + statement.getName() + '.');
            }
        }
        
        //////    LIST   ///////
        statement.LAGVEUL = Y.Node.create( '<div id=' + Y.guid('statement-ul-') + ' class="statement-list"></div>' );
        statement.LAGVEUL.resize = function(reason) { statement.resize(reason) };
        statement.LAGVEUL.plug(
            Y.Plugin.Drop,
            {
                node:   statement.LAGVEUL,
                groups: ['statement-list'],
            }
        );
        statement.append(statement.LAGVEUL);
        
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
        var childContainer      = Y.Node.create( '<div class="statement-child-container deletable"></div>' );
    
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
            opacity:    '.25'
        });
        
        drag.get('dragNode').set('innerHTML', drag.get('node').get('innerHTML'));
        
        // make dragNode's style match node but at 50% opacity
        drag.get('dragNode').setStyles({
            opacity:            '.5',
            borderColor:        drag.get('node').getStyle('borderColor'),
            backgroundColor:    drag.get('node').getStyle('backgroundColor')
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





/* CONTEXT MENU */
LAGVEContext = new Object();


    /*
    switch (context.name) {
        case 'assignment': _useButton(LAGVEContext.assignment);
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
        return node.hasClass('VE-workspace');
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
        LAGVE.initialization.statementBox.removeClass('deletable');
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
        LAGVE.implementation.statementBox.removeClass('deletable');
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
        LAGVE._hideAttrMenu()
    }
    
    LAGVE.insertNewBoolean = function(value) {
        LAGVE.Attr.newBoolean(value);
        LAGVE._hideAttrMenu()
    }
    
    LAGVE._hideAttrMenu = function() {
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
        // update last code change converted to visual
        LAGVE.ToVisual.lastEditorChange = editorChangeTimestamp;
        
        // allow conversion - unset by implementation handler
        LAGVE.ToVisual.converting = true;
        
        // hackedly force full parse by copying
        // and replacing all the code in the editor.
        var code = editor.mirror.getCode();
        editor.mirror.setCode(code);
        
    }
        
    // this is called to create an action function that goes on the action 
    // stack. It is always called so we have to check the global (in the 
    // browser window, not the CodeMirror iframe) variable 'convertingToVisual'
    //
    // this can be separated out into individual functions, but it's
    // easier to edit as a switch with all the actions together.
    LAGVE.ToVisual.action = function(command, tokenValue) {
        if (LAGVE.ToVisual.converting) {
            return function() {
                Y.log('found ' + command);
                switch (command) {
                    case 'start init':
                        // initialization always exists so don't create it. 
                        // Just find it and put it on the stack so we can 
                        // insert its contents
                        LAGVE.ToVisual.stack.push(LAGVE.initialization);
                        // init should now be at top of stack. We're ready 
                        // to insert its contents so empty it.
                        LAGVE.ToVisual.stack.peek().empty();
                        break;
                    case 'finish init':
                        LAGVE.ToVisual.stack.pop();
                        break;
                    case 'start impl':
                        // implementation always exists so don't create it. 
                        // Just find it and put it on the stack so we can 
                        // insert its contents
                        LAGVE.ToVisual.stack.push(LAGVE.implementation);
                        // init should now be at top of stack. We're ready 
                        // to insert its contents so empty it.
                        LAGVE.ToVisual.stack.peek().empty();
                        break;
                    case 'finish impl':
                        LAGVE.ToVisual.stack.pop();
                        // We're not adding anything after implementation so
                        // stop trying to convert things to visual until 
                        // told otherwise
                        LAGVE.ToVisual.converting = false;
                        break;
                    case 'start if':
                        // create new if-then-else
                        var newIf = LAGVEIf.newIf();
                        // insert to top of stack
                        LAGVE.ToVisual.stack.peek().LAGVEInsert(newIf);
                        // put it at top of stack so we can insert to it
                        LAGVE.ToVisual.stack.push(newIf);
                        break;
                    case 'start condition':
                        // push the condition of the thing at top of stack
                        LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().conditionContainer);
                        break;
                    case 'finish condition':
                        LAGVE.ToVisual.stack.pop();
                        break;
                    case 'start then':
                        // push the Then block of the thing at top of stack
                        LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().thenStatementBlock);
                        break;
                    case 'finish then':
                        LAGVE.ToVisual.stack.pop();
                        break;
                    case 'start else':
                        // push the Else block of the thing at top of stack
                        LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().elseStatementBlock);
                        break;
                    case 'finish else':
                        LAGVE.ToVisual.stack.pop();
                        break;
                    case 'finish if':
                        LAGVE.ToVisual.stack.pop();
                        break;
                    case 'boolean':
                        // target node is whatever's on top of LAGVE.ToVisual.stack
                        var newBoolean = LAGVE.Attr.newBoolean(tokenValue, LAGVE.ToVisual.stack.peek());
                        break;
                    case 'start assignment':
                        // create new assignment
                        // target node is whatever's on top of LAGVE.ToVisual.stack
                        var newAssignment = LAGVE.Assignment.newAssignment(LAGVE.ToVisual.stack.peek());
                        // push new assignment onto LAGVE.ToVisual.stack so we can find it
                        LAGVE.ToVisual.stack.push(newAssignment);
                        // push new assignment's attribute container onto LAGVE.ToVisual.stack
                        // because we're expecting an attribute that we'll want to insert.
                        LAGVE.ToVisual.stack.push(newAssignment.attributeContainer);
                        break;
                    case 'operator':
                        // pop the assignment attribute container off of LAGVE.ToVisual.stack
                        LAGVE.ToVisual.stack.pop();
                        // set the operator of the assignement statement 
                        // at the top of LAGVE.ToVisual.stack to the operator token value
                        LAGVE.ToVisual.stack.peek().setOperator(tokenValue);
                        // push the assignment value container onto LAGVE.ToVisual.stack
                        LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().valueContainer);
                        break;
                    case 'finish assignment':
                        // pop the value container off
                        LAGVE.ToVisual.stack.pop();
                        // pop the assignment off
                        LAGVE.ToVisual.stack.pop();
                        break;
                    case 'start attribute':
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
                        break;
                    case 'finish attribute':
                        // finished the attribute (not adding anything more to it)
                        // so pop it off.
                        // Check whether the top of stack really is an attribute box
                        // because things like Enough take the value token but don't build an
                        // attribute/value visual element for it.
                        if (LAGVE.ToVisual.stack.peek().hasClass('attr_box'))
                            LAGVE.ToVisual.stack.pop();
                        break;
                    case 'model':
                        // get value of attribute on top of LAGVE.ToVisual.stack
                        var currentValue = LAGVE.ToVisual.stack.peek().getValue();
                        // don't prepend a '.' to the first Model
                        var newValue = ((currentValue === '') ? '' : currentValue + '.') + tokenValue;
                        // update value
                        LAGVE.ToVisual.stack.peek().setValue(newValue);
                        break;
                    case 'start enough':
                        // make a new Enough
                        var newEnough = LAGVE.Condition.newEnough();
                        // insert to the thing at the top of LAGVE.ToVisual.stack
                        LAGVE.ToVisual.stack.peek().LAGVEInsert(newEnough);
                        // push onto LAGVE.ToVisual.stack
                        LAGVE.ToVisual.stack.push(newEnough.getCondition());
                        break;
                    case 'start enough threshold':
                        // Get the new Enough from the top of LAGVE.ToVisual.stack,
                        // get its threshold container and push that 
                        // to LAGVE.ToVisual.stack.
                        LAGVE.ToVisual.stack.push(
                            LAGVE.ToVisual.stack.peek().getThreshold()
                        );
                        break;
                    case 'finish enough threshold':
                        LAGVE.ToVisual.stack.pop();
                        break;
                    case 'start comparison':
                        // create new comparison target node is whatever's on top of LAGVE.ToVisual.stack.
                        // getCondition() at the end because conditions except booleans 
                        // are currently wrapped in a conditionWrapper.
                        var newComparison = LAGVE.Condition.newComparison(LAGVE.ToVisual.stack.peek()).getCondition();
                        // push new assignment onto LAGVE.ToVisual.stack so we can find it
                        LAGVE.ToVisual.stack.push(newComparison);
                        // push new assignment's comparison container onto LAGVE.ToVisual.stack
                        // because we're expecting an comparison that we'll want to insert.
                        LAGVE.ToVisual.stack.push(newComparison.attributeContainer);
                        break;
                    case 'comparator':
                        // pop the comparison attribute container off of LAGVE.ToVisual.stack
                        LAGVE.ToVisual.stack.pop();
                        // set the comparator of the comparison 
                        // at the top of LAGVE.ToVisual.stack to the comparator token value
                        LAGVE.ToVisual.stack.peek().setComparator(tokenValue);
                        // push the assignment value container onto LAGVE.ToVisual.stack
                        LAGVE.ToVisual.stack.push(LAGVE.ToVisual.stack.peek().valueContainer);
                        break;
                    case 'finish comparison':
                        // pop the value container off
                        LAGVE.ToVisual.stack.pop();
                        // pop the comparison off
                        LAGVE.ToVisual.stack.pop();
                        break;
                    default:
                        Y.log('nothing to do for \'' + command + '\'');
                        break;
                }
            }
        } else { 
            // this has to return some function as an action, even noop.
            // the alternative is to make Parser's push() ignore non-functions.
            // can't decide which is more correct right now.
            return noop
        }
    }
     
    // my 'no operation' function.
    // could do with being placed in a safer namespace.
    function noop() {}
    
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

