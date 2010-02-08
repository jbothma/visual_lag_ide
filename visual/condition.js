LAGVECondition = new Object();
LAGVECondition.scriptName = 'condition.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVECondition.newCondition = function(targetNode) {
		var condition 			= Y.Node.create( '<div class="condition"></div>' );
		condition._LAGVEName = 'Condition';		
		condition.getName = function() {return this._LAGVEName};
		
		var attributeContainer	= Y.Node.create( '<div class="condition-attribute-container condition-child-container selectable" title="Drop an attribute here."></div>' );
		attributeContainer._LAGVEName = 'Attribute position';
		attributeContainer.getName = function() {return this._LAGVEName};
		
		var valueContainer		= Y.Node.create( '<div class="condition-attribute-container condition-child-container selectable" title="Drop an attribute or value here."></div>' );
		attributeContainer._LAGVEName = 'Value position';
		attributeContainer.getName = function() {return this._LAGVEName};
		var comparatorContainer = Y.Node.create( '<div class="condition-comparator-container condition-child-container" title="Select an comparator from the list."></div>' );
		
		var attributeContainerDT	= new Y.DD.Drop({	node:	attributeContainer,
														groups:	['attribute'] });
		
		var valueContainerDT 		= new Y.DD.Drop({	node:	valueContainer,
														groups:	['attribute']  });
		
		attributeContainerDT.node	= attributeContainer;
		valueContainerDT.node		= valueContainer;
		
		attributeContainer.LAGVEInsert	= function(node) {LAGVECondition.tryInsertConditionChild(attributeContainer,node)};
		valueContainer.LAGVEInsert		= function(node) {LAGVECondition.tryInsertConditionChild(valueContainer,node)};
		
		var comparatorSelect =  Y.Node.create(	'<select class="comparator-select">' +
												'<option value="==">==</option>' +
												'<option value="&gt;">&gt;</option>' +
												'<option value="&gt;">&gt;</option>' +
												'</select>');
		comparatorContainer.append(comparatorSelect);
		
		condition.append(attributeContainer);
		condition.append(comparatorContainer);
		condition.append(valueContainer);
		
		if (isset(targetNode)) {
			targetNode.LAGVEInsert(condition);
		}
		
		return condition;
	}
	
	LAGVECondition.tryInsertConditionChild = function(target,child) {
		if (target.hasClass('condition-child-container')) {
			if (child.hasClass('condition-child')) {
				if (!target.hasChildNodes()) {			
					target.append(child);				
				} else {
					//Y.log('LAGVECondition.insertConditionChild() didn\'t insert. Target had a child.');
				}
				
				LAGVECondition._positionChild(child);
			} 
		}
	}
	
	LAGVECondition._positionChild = function(child) {
		if (child.hasClass('condition-child')) {
			child.setStyles({	position:	'relative',
								left:		'0px',
								top:		'0px'});
		}
	}
	
	Y.DD.DDM.on('drop:enter',function(e) {
		LAGVECondition.tryInsertConditionChild(e.drop.get('node'),e.drag.get('node'));
	});
	
	Y.DD.DDM.on('drop:hit',function(e) {
		LAGVECondition.tryInsertConditionChild(e.drop.get('node'),e.drag.get('node'));
	});
	
	Y.DD.DDM.on('drag:dropmiss',function(e) {
		LAGVECondition._positionChild(e.target.get('node'));
	});
});