LAGVECondition = new Object();
LAGVECondition.scriptName = 'condition.js';

getMyY().use('dd-drag-plugin','dd-proxy','dd-drop-plugin','node','event', function (Y) {
	/**
	 *	Dragable, reorderable HTML LI
	 *	To be called by the function creating a new condition, e.g. a new Comparison
	 *	Returns the container LI after inserting the new condition.
	 *	Parameters:	condition
	 */
	LAGVECondition.wrapConditionInLI = function(child) {
		var conditionLI = Y.Node.create( '<li class="condition deletable"></li>' );
	
		var conditionLIdd = new Y.DD.Drag({
			groups:	['condition'],
			node:	conditionLI,
		});
													
		conditionLIdd.plug(
			Y.Plugin.DDProxy, 
			{
				moveOnEnd:	false,
			}
		);
		
		var conditionLIdd = new Y.DD.Drop({
			groups:	['condition'],
			node:	conditionLI,
			}
		);
		
		conditionLI.parentChanged = function() {
			if (this.get('parentNode')) {
				this.resize = this.get('parentNode').resize;
				this.resize('new parent');
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
		
		return conditionLI;
	};
	
	LAGVECondition.newComparison = function(targetNode) {
		///////    COMPARISON    ///////
		var comparison 			= Y.Node.create( '<div class="comparison"></div>' );
		comparison._LAGVEName	= 'Comparison';		
		comparison.getName		= function() {return this._LAGVEName};
		comparison.resize 		= function()	 {this.get('parentNode').resize('child comparison.resize')};
		
		
		//////    ATTRIBUTE CONTAINER    //////
		var attributeContainer			= Y.Node.create('\
			<div class="comparison-attribute-container comparison-child-container selectable" \
			title="Drop an attribute here."></div>\
		');
		var attributeContainerDT		= new Y.DD.Drop({
			node:	attributeContainer,
			groups:	['attribute'],
		});
		attributeContainer._LAGVEName 	= 'Attribute position';
		attributeContainer.getName 		= function() {return this._LAGVEName};
		attributeContainer.select 		= LAGVE._genericSelect;
		attributeContainer.deSelect 	= LAGVE._genericDeSelect;
		attributeContainer.LAGVEInsert	= function(node) {LAGVECondition.tryInsertComparisonChild(attributeContainer,node)};
		attributeContainer.resize 		= function()	 {comparison.resize('child attributeContainer.resize')};
		
		
		//////    COMPARATOR    //////
		var comparatorContainer			= Y.Node.create('\
			<div class="comparison-comparator-container comparison-child-container" \
			title="Select an comparator from the list."></div>\
		');
		var comparatorSelect =  Y.Node.create('\
			<select class="comparator-select">\
				<option value="==">==</option>\
				<option value="&gt;">&gt;</option>\
				<option value="&gt;">&gt;</option>\
			</select>\
		');
		
		
		//////    VALUE CONTAINER    //////
		var valueContainer			= Y.Node.create('\
			<div class="comparison-attribute-container comparison-child-container selectable" \
			title="Drop an attribute here."></div>\
		');
		var valueContainerDT 		= new Y.DD.Drop({
			node:	valueContainer,
			groups:	['attribute'],
		});
		valueContainer._LAGVEName	= 'Value position';
		valueContainer.getName 		= function() {return this._LAGVEName};		
		valueContainer.LAGVEInsert	= function(node) {LAGVECondition.tryInsertComparisonChild(valueContainer,node)};
		valueContainer.resize 		= function()	 {comparison.resize('child attributeContainer.resize')};
		valueContainer.select 		= LAGVE._genericSelect;
		valueContainer.deSelect 	= LAGVE._genericDeSelect;
		
		
		//////    BUILD, INSERT/RETURN    //////
		comparison.append(			attributeContainer);
		comparatorContainer.append(	comparatorSelect);
		comparison.append(			comparatorContainer);
		comparison.append(			valueContainer);
		
		// Wrap comparison in an LI as a generic Condition
		var condition = LAGVECondition.wrapConditionInLI(comparison);
		
		if (isset(targetNode)) {
			targetNode.LAGVEInsert(condition);
		}
		
		return condition;
	}
	
	LAGVECondition.tryInsertComparisonChild = function(target,child) {
		if (target.hasClass('comparison-child-container')) {
			if (child.hasClass('comparison-child')) {
				if (!target.hasChildNodes()) {			
					target.append(child);
					target.resize();
				} else {
					//Y.log('LAGVECondition.insertComparisonChild() didn\'t insert. Target had a child.');
				}
				
				LAGVECondition._positionChild(child);
			} 
		}
	}
	
	LAGVECondition._positionChild = function(child) {
		if (child.hasClass('comparison-child')) {
			child.setStyles({	position:	'relative',
								left:		'0px',
								top:		'0px'});
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