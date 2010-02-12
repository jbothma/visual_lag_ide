LAGVECondition = new Object();
LAGVECondition.scriptName = 'condition.js';

getMyY().use('dd-drag-plugin','dd-proxy','dd-drop-plugin','node','event', function (Y) {
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
    
    /**
     *   Logical Conjunction visual item
     *
     *                 . . . . . . . . . . . . . . . . . . ..
     *                innardsContainer  __________________  .
     *                 .               |  ______________  | .
     *                 .               | |              | | .
     *                 .               | |  condition   | | .
     *                 .               | |______________| | .
     *                 .               |  ______________  | .
     *                 .               | |              | | .
     *                 .              /| |  condition   | | .
     *                 .             / | |______________| | .
     *                 .    _       /  |__________________| .
     *                 .,`     `.  /                        .
     *                /.          \                         .
     *                !.   AND    !                         .
     *                \.          /                         .
     *                 .`.. _ ..`. . . . . . . . . . . . . ..
     *
     *  -   Diagonal line is an image with transparent background. It just has to 
     *          start and end behind the things it's connecting, doesn't need to be exact.
     *  -   Circle is Div with CSS3 rounded corners (maybe images for IE if i'm nice
     *  -   Circle is contained in a Condition wrapper LI, Condition wrapper LI must scale 
     *          to circle's size but exclude condition list
     *  -   Condition container list is absolutely positioned.
     *  -   Condition container list and diagonal line are contained by innardsContainer
     *  -   .resize() will need to widen the container DIV
     *
     *  When user mouse over the circle, the entire conjunction element's 
     *      z-index is set to something like 1000 to make sure all the conditions
     *      are visible.
     *      When user mouse out, z-index is restored.
     */ 
    LAGVECondition.newConjunction = function(targetNode) {
        var conjunction = Y.Node.create('\
            <div class="conjunction primary">AND</div>\
        ');
        conjunction._LAGVEName   = 'Conjunction';        
        conjunction.getName      = function() {
            return this._LAGVEName
        };
        
        conjunction._resize = function() {}
        
        
        conjunction.innardsContainer = Y.Node.create('\
            <div class="conjunction innards-container"></div>\
        ');
        conjunction.diagonal = Y.Node.create('\
            <div class="conjunction diagonal-container"></div>\
        ');
        
        conjunction.conditionList = Y.Node.create('\
            <ul class="conjunction condition-list selectable"></ul>\
        ');
        conjunction.conditionList.plug(
            Y.Plugin.Drop,
            {
                groups:    ['condition'],
            }
        );        
        conjunction.conditionList.resize        = function() {}
        conjunction.conditionList.select        = LAGVE._genericSelect;
        conjunction.conditionList.deSelect      = LAGVE._genericDeSelect;

        conjunction.conditionList.LAGVEInsert   = function(child) {
            if (child.hasClass('condition')) {
                if (this.get('children').size() < 2) {            
                    this.append(child);
                    child.parentChanged();
                    child.resize('conjunction.conditionList.LAGVEInsert');
                }
            }
        }
        
        conjunction.innardsContainer.append(conjunction.diagonal);
        conjunction.innardsContainer.append(conjunction.conditionList);
        
        conjunction.append(conjunction.innardsContainer);
        
        // Wrap conjunction in an LI as a generic Condition
        var condition = LAGVECondition.wrapConditionInLI( conjunction );

        if ( isset( targetNode )) {
            targetNode.LAGVEInsert(condition);
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
        LAGVECondition.tryInsertComparisonChild(e.drop.get('node'),e.drag.get('node'));
    });
    
    Y.DD.DDM.on('drop:hit',function(e) {
        LAGVECondition.tryInsertComparisonChild(e.drop.get('node'),e.drag.get('node'));
    });
    
    Y.DD.DDM.on('drag:dropmiss',function(e) {
        LAGVECondition._positionChild(e.target.get('node'));
    });
});