/* UTILITY */
function isset(variable)
{
    return ( typeof(variable) == "undefined" || variable == null )?  false: true;
}

/**
 * Make function to allow each use of YUI3 to use the same YUI instance.
 */
function getMyY() {
    if (typeof(myY) != "undefined" && myY != null) {
        //alert('myY was set, returning.');
        return myY;
    } else {
        //alert('no myY, creating and returning.');
        // Create global YUI3 instance
        myY = YUI({ filter:'raw' });
        return myY;
    }
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





/* ATTRIBUTE */
/**
 *    LAGVEAttr
 *
 *    Library for the LAG Visual Editor Attribute item
 */ 

var LAGVEAttr = new Object();
LAGVEAttr.scriptName = 'attribute.js';

getMyY().use('dd-constrain','node','event', function (Y) {

    /**
     *
     */
    LAGVEAttr.newAttrLevel = function(levelValue, isRoot, sublevel) {
        var attrBox = Y.Node.create('<div class="attr_box"></div>');
        var attrBoxValue = Y.Node.create('<div class="attr_box_value">' + levelValue + '</div>');
        var subLevelContainer = Y.Node.create('<div class="sub_level_container"></div>');
        
        attrBox.append(attrBoxValue);
        attrBox.append(subLevelContainer);
        
        attrBox.valueDiv = attrBoxValue;
        attrBox.subLevelContainer = subLevelContainer;
        
        attrBox.addSubLevel = function(attrLevel) {
            attrLevel.addClass('sub_level');
            this.subLevelContainer.append(attrLevel);
        }
        
        if (isset(sublevel)) {
            attrBox.addSubLevel(sublevel);
        }
        
        return attrBox;
    }
    

    /**
     *    insertNewAttr(['PM','GM','accessed'],'visual-editing-workspace')
     *  would append PM.GM.accessed to the element 
     *    with id visual-editing-workspace
     */
    LAGVEAttr.insertNewAttr = function(levels,targetNode) {
        var lowestAttrLevel;
        
        /*    create attribute levels in reverse
         *    e.g. for PM.GM.visible
         *    make visible, then make GM and insert visible to it, 
         *    then make PM and insert GM.visible into it. */
        for (var i = levels.length-1; i >= 0; i--) {
            lowestAttrLevel = LAGVEAttr.newAttrLevel(levels[i],false,lowestAttrLevel);
        }
        
        var newAttribute = lowestAttrLevel;
        newAttribute._LAGVEName = 'Attribute/Value';
        newAttribute.getName = function() { return this._LAGVEName }
        /**
         *
         */
        newAttribute.resize = function(reason) {
            //Y.log('newAttribute.resize triggered by ' + reason);
            // Setup
            var valueWidth      = parseInt(this.valueDiv.getComputedStyle('width'));
            var subLevelWidth   = parseInt(this.subLevelContainer.getComputedStyle('width'));
                        
            // Compute
            attributeWidth      = valueWidth + subLevelWidth + 28;
            
            // Output
            this.setStyle('width', attributeWidth + 'px');
            
            this.get('parentNode').resize('attribute resize | ' + reason);
        }
        
        // make the root attribute level box dragable
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
        newAttribute.addClass('action-child');
        newAttribute.addClass('comparison-child');
        
        // Default to selected node.
        if (!isset(targetNode)) {
            targetNode = LAGVE.selectedNode;
        }
        
        if (isset(targetNode)) {
            targetNode.LAGVEInsert(newAttribute);
        } 
        
        return newAttribute;
    }
});





/* ACTION */
LAGVEActn = new Object();
LAGVEActn.scriptName = 'action.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
        
    LAGVEActn.newAction = function(targetNode) {
        //////    ACTION    //////
        var action      = Y.Node.create( '<div class="action statement-child"></div>' );
        action.resize   = function(reason) {
            //Y.log('action.resize triggered by ' + reason);
            // Setup
            var attributeContainerWidth = parseInt(this.attributeContainer.getComputedStyle('width'));
            var valueContainerWidth     = parseInt(this.valueContainer.getComputedStyle('width'));
            var operatorContainerWidth  = parseInt(this.operatorContainer.getComputedStyle('width'));
                        
            // Compute
            actionWidth = attributeContainerWidth + operatorContainerWidth + valueContainerWidth + 22;
            
            // Output
            this.setStyle('width', actionWidth + 'px');
            
            // Bubble
            this.get('parentNode').resize('action.resize | ' + reason);
        }
        action._LAGVEName     = 'Action';
        action.getName        = function() { return this._LAGVEName };
        
        //////    ATTRIBUTE CONTAINER    //////
        action.attributeContainer               = Y.Node.create('\
            <div    class="action-attribute-container action-child-container selectable" \
                    \title="Drop an attribute here."></div>\
        ');
        action.attributeContainer._LAGVEName    = 'Action attribute';
        action.attributeContainer.select        = LAGVE._genericSelect;
        action.attributeContainer.deSelect      = LAGVE._genericDeSelect;
        action.attributeContainer.LAGVEInsert   = function(node) {
            if (LAGVEActn.tryInsertActionChild(action.attributeContainer,node)) {
                node.resize('action.attributeContainer.LAGVEInsert');
            }
        };
        action.attributeContainer.getName       = function() { return this._LAGVEName };
        action.attributeContainer.resize        = function( reason ) { 
            action.resize('child action.attributeContainer.resize | ' + reason) 
        };
        new Y.DD.Drop({
            node:        action.attributeContainer,
            groups:        ['attribute'],
        });
        
        
        //////    VALUE CONTAINER    //////
        action.valueContainer               = Y.Node.create('\
            <div class="action-attribute-container action-child-container selectable" \
            title="Drop an attribute or value here."></div>\
        ');
        action.valueContainer._LAGVEName    = 'Action value';
        action.valueContainer.select        = LAGVE._genericSelect;
        action.valueContainer.deSelect      = LAGVE._genericDeSelect;
        action.valueContainer.resize        = function( reason ) { 
            action.resize('child action.valueContainer.resize | ' + reason);
        };
        new Y.DD.Drop({
            node:    action.valueContainer,
            groups:    ['attribute'],
        });
        action.valueContainer.LAGVEInsert   = function(node) {
            if (LAGVEActn.tryInsertActionChild(action.valueContainer,node)) {
                node.resize('action.valueContainer.LAGVEInsert');
            }
        };
        action.valueContainer.getName       = function() { return this._LAGVEName };
        
        
        //////    OPERATOR CONTAINER    //////
        action.operatorContainer    = Y.Node.create('\
            <div class="action-operator-container action-child-container" \
            title="Select an operator from the list."></div>\
        ');
        action.operatorSelect       =  Y.Node.create(
            '<select class="operator-select">\
                <option value="=">=</option>\
                <option value="+=" title="Add to the current value">+=</option>\
                <option value="-=">-=</option>\
                <option value=".=">.=</option>\
            </select>'
        );
        action.operatorContainer.append(action.operatorSelect);
        
        
        //////      BUILD AND INSERT/RETURN    //////
        action.append(action.attributeContainer);
        action.append(action.operatorContainer);
        action.append(action.valueContainer);
                
        if (isset(targetNode)) {
            targetNode.LAGVEInsert(action);
        }
        
        return action;
    }
    
    LAGVEActn.tryInsertActionChild = function(target,child) {
        if (target.hasClass('action-child-container')) {
            if (child.hasClass('action-child')) {
                if (!target.hasChildNodes()) {            
                    target.append(child);
                    target.resize('LAGVEActn.tryInsertActionChild');
                    return true;
                }
        
                LAGVEActn._positionChild(child);
            }
        }
        return false;
    }
    
    LAGVEActn._positionChild = function(child) {
        if (child.hasClass('action-child')) {
            child.setStyles({
                position:    'relative',
                left:        '0px',
                top:        '0px',
            });
        }
    }
    
    Y.DD.DDM.on('drop:enter',function(e) {
        LAGVEActn.tryInsertActionChild(e.drop.get('node'),e.drag.get('node'));
    });
    
    Y.DD.DDM.on('drop:hit',function(e) {
        LAGVEActn.tryInsertActionChild(e.drop.get('node'),e.drag.get('node'))
    });
    
    Y.DD.DDM.on('drag:dropmiss',function(e) {
        if (e.target.get('node').hasClass('action-child')) {
            LAGVEActn._positionChild(e.target.get('node'));
        }
    });
});




/* IF-THEN-ELSE */
LAGVEIf = new Object();
LAGVEIf.scriptName = 'ifthenelse.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
        
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
            this.get('parentNode').resize('child action.resize | ' + reason);
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
            <ul id=' + Y.guid('condition-container-') + ' \
            class="ifthenelse-condition-container"></ul>\
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
});




/* CONDITION */
LAGVECondition = new Object();
LAGVECondition.scriptName = 'condition.js';

getMyY().use('dd-drag-plugin','dd-proxy','dd-drop-plugin','node','event',function (Y) {
    /**
     *    Dragable, reorderable HTML LI
     *    To be called by the function creating a new condition, e.g. a new Comparison
     *    Returns the container LI after inserting the new condition.
     *    Parameters:    condition
     */
    LAGVECondition.wrapConditionInLI = function(child) {
        var conditionLI = Y.Node.create( '<li class="condition deletable"></li>' );
    
        var conditionLIdd = new Y.DD.Drag({
            groups:    ['condition'],
            node:    conditionLI,
        });
                                                    
        conditionLIdd.plug(
            Y.Plugin.DDProxy, 
            {
                moveOnEnd:    false,
            }
        );
        
        conditionLI.resize = function(reason) {             
            this.get('firstChild')._resize('conditionLI.resize')
            
            //Bubble
            this.get('parentNode').resize('conditionLI.resize')
        }
        conditionLI.parentChanged = function() {
            if (this.get('parentNode')) {
                //this.resize = this.get('parentNode').resize;
                //this.resize('new parent');
            }
            if (this._oldParent) {
                this._oldParent.resize('parentChanged');
            }
            this._oldParent = this.get('parentNode');
        }
        
        conditionLI.getName = function() {
            return child.getName();
        }

        conditionLI.append(child);
        conditionLI.parentChanged();        
        //child.resize('new condition');
        
        return conditionLI;
    };
    
    LAGVECondition.newComparison = function(targetNode) {
        ///////    COMPARISON    ///////
        var comparison          = Y.Node.create( '<div class="comparison"></div>' );
        comparison._LAGVEName   = 'Comparison';        
        comparison.getName      = function() {
            return this._LAGVEName
        };
        
        comparison._resize = function(reason) {
            Y.log('comparison._resize by ' + reason);
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
            if (LAGVECondition.tryInsertComparisonChild(comparison.attributeContainer,node)) {
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
                <option value="==">==</option>\
                <option value="&gt;">&gt;</option>\
                <option value="&lt;">&lt;</option>\
            </select>\
        ');
        
        
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
            if (LAGVECondition.tryInsertComparisonChild(comparison.valueContainer,node)) {
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
        
        // Wrap comparison in an LI as a generic Condition
        var condition = LAGVECondition.wrapConditionInLI( comparison );
        
        if ( isset( targetNode )) {
            targetNode.LAGVEInsert(condition);
        }
        
        return condition;
    }
    
    LAGVECondition._enoughThing = function() {
        var enough = Y.Node.create('\
            <div class="xjunction enough">ENOUGH = </div>\
        ');
        
        enough.valueBox = Y.Node.create('\
            <input type="text" class="xjunction enough value-box" value="1">\
        ');
        
        enough.append(enough.valueBox);
        
        return enough;
    }
    
    /**
     *   Logical Con/Disjunction/Enough visual item
     *
     *  LAGVECondition.newXjunction({
     *      targetNode: LAGVE.selectedNode,
     *      type:       'conjunction',
     *  });
     *
     *                                 __________________  
     *                                |  ______________  | 
     *                                | |              | | 
     *                                | |  condition   | | 
     *                                | |______________| | 
     *                                |  ______________  | 
     *                                | |              | | 
     *                               /| |  condition   | | 
     *                              / | |______________| | 
     *                     _       /  |__________________| 
     *                 ,`     `.  /                        
     *                /         \                         
     *                !  AND    !                         
     *                \         /                         
     *                 ` . _ . `
     *
     *  -   Diagonal line is an image with transparent background. It just has to 
     *          start and end behind the things it's connecting, doesn't need to be exact.
     *  -   Circle is Div with CSS3 rounded corners (maybe images for IE if i'm nice
     *  -   Circle is contained in a Condition wrapper LI, Condition wrapper LI must scale 
     *          to circle's size but exclude condition list
     *  -   Condition container list is absolutely positioned.
     *  -   .resize() will need to widen the container DIV
     *
     */ 
    LAGVECondition.newXjunction = function(options) {        
        var xjunction = Y.Node.create('\
            <div class="xjunction primary selectable"></div>\
        ');
        
        if ( isset( options ) && isset( options.type )) {
            switch (options.type) {
                case 'conjunction' :
                    xjunction._maxConds = 2;
                    xjunction.set('innerHTML','AND');
                    xjunction._LAGVEName    = 'Conjunction';
                    break;
                case 'disjunction' :
                    xjunction._maxConds = 2;
                    xjunction.set('innerHTML','OR');
                    xjunction._LAGVEName    = 'Disjunction';
                    break;
                case 'enough' :
                    xjunction._maxConds = null;
                    xjunction.append( LAGVECondition._enoughThing() );
                    xjunction.addClass('enough');
                    xjunction._LAGVEName    = 'Enough';
                    break;
                default:
                    Y.log('options.type not specified correctly. enough, conjunction and disjunction are allowed.','error');
                    return false;
            }
        } else {
            Y.log('options.type not specified. enough, conjunction and disjunction are allowed.','error');
            return false;
        }
        
            
        xjunction.getName       = function() {
            return this._LAGVEName
        };
        
        xjunction._resize       = function() {}
        
        xjunction.select        = function() { 
            this.addClass('selected');
            xjunction.conditionList.select() 
        };
        
        xjunction.deSelect      = function() { 
            this.removeClass('selected');
            xjunction.conditionList.deSelect() 
        };
        
        xjunction.LAGVEInsert   = function(child) {
            xjunction.conditionList.LAGVEInsert(child);
        }
        
        xjunction.diagonal = Y.Node.create('\
            <div class="xjunction diagonal-container"></div>\
        ');
        
        xjunction.conditionList = Y.Node.create('\
            <ul class="xjunction condition-list selectable"></ul>\
        ');
        xjunction.conditionList.plug(
            Y.Plugin.Drop,
            {
                groups:    ['condition'],
            }
        );        
        xjunction.conditionList.resize        = function() {}
        xjunction.conditionList.select        = LAGVE._genericSelect;
        xjunction.conditionList.deSelect      = LAGVE._genericDeSelect;

        xjunction.conditionList.LAGVEInsert   = function(child) {
            if (child.hasClass('condition')) {
                if (xjunction._maxConds === null || this.get('children').size() < xjunction._maxConds) {            
                    this.append(child);
                    child.parentChanged();
                    child.resize('xjunction.conditionList.LAGVEInsert');
                }
            }
        }
        
        xjunction.append(xjunction.diagonal);
        xjunction.append(xjunction.conditionList);
        
        // Wrap xjunction in an LI as a generic Condition
        var condition = LAGVECondition.wrapConditionInLI( xjunction );

        if ( isset( options ) && isset( options.targetNode )) {
            options.targetNode.LAGVEInsert(condition);
        }
        
        return condition;
    }
    
    LAGVECondition.tryInsertComparisonChild = function( target, child ) {
        if (target.hasClass('comparison-child-container')) {
            if (child.hasClass('comparison-child')) {
                if (!target.hasChildNodes()) {            
                    target.append(child);
                    target.resize('LAGVECondition.tryInsertComparisonChild');
                    return true;
                } else {
                    //Y.log('LAGVECondition.insertComparisonChild() didn\'t insert. Target had a child.');
                }
                
                LAGVECondition._positionChild(child);
            } 
        }
        return false;
    }
    
    LAGVECondition._positionChild = function(child) {
        if (child.hasClass('comparison-child')) {
            child.setStyles({   position:   'relative',
                                left:       '0px',
                                top:        '0px'});
        }
    }
    
    Y.DD.DDM.on('drop:enter',function(e) {
        var dropNode = e.target.get('node');
        var dragNode = e.drag.get('node');
        
        if (dropNode.hasClass('xjunction') && dropNode.hasClass('condition-list')) {
            dropNode.LAGVEInsert(dragNode);
        }
        
        LAGVECondition.tryInsertComparisonChild(dropNode,dragNode);
    });
    
    Y.DD.DDM.on('drop:hit',function(e) {
        LAGVECondition.tryInsertComparisonChild(e.drop.get('node'),e.drag.get('node'));
    });
    
    Y.DD.DDM.on('drag:dropmiss',function(e) {
        LAGVECondition._positionChild(e.target.get('node'));
    });
});




/* STATEMENT */
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
        statement.LAGVEUL = Y.Node.create( '<ul id=' + Y.guid('statement-ul-') + ' class="statement-list"></ul>' );
        statement.LAGVEUL.resize = function(reason) { statement.resize(reason) };
        statement.LAGVEUL.plug(
            Y.Plugin.Drop,
            {
                node:   statement.LAGVEUL,
                groups: ['statement-list'],
            }
        );        
        
        statement.append(statement.LAGVEUL);
        
        
        //////    INSERT/RETURN   ///////
        if (isset(targetNode)) {
            targetNode.LAGVEInsert(statement);
        }
        
        return statement;
    };
    
    LAGVEStmt._newStatementChildContainer = function(child) {
        var childContainer      = Y.Node.create( '<li class="statement-child-container deletable"></li>' );
    
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
});





/* CONTEXT MENU */
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





/* CONNECTOR */
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




/* VISUAL EDITOR */
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