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