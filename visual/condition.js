LAGVECondition = new Object();
LAGVEActn.scriptName = 'condition.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVECondition.newCondition = function() {
		var condition 			= Y.Node.create( '<div class="condition"></div>' );
		
		var attributeContainer	= Y.Node.create( '<div class="condition-attribute-container condition-child-container" title="Drop an attribute here."></div>' );
		var valueContainer		= Y.Node.create( '<div class="condition-attribute-container condition-child-container" title="Drop an attribute or value here."></div>' );
		var comparatorContainer = Y.Node.create( '<div class="condition-comparator-container condition-child-container" title="Select an comparator from the list."></div>' );
		
		var attributeContainerDT	= new Y.DD.Drop({	node:	attributeContainer,
														groups:	['attribute'] });
		
		var valueContainerDT 		= new Y.DD.Drop({	node:	valueContainer,
														groups:	['attribute']  });
		
		attributeContainerDT.node	= attributeContainer;
		valueContainerDT.node		= valueContainer;
		
		var comparatorSelect =  Y.Node.create(	'<select class="comparator-select">' +
												'<option value="==">==</option>' +
												'<option value="&gt;">&gt;</option>' +
												'<option value="&gt;">&gt;</option>' +
												'</select>');
		comparatorContainer.append(comparatorSelect);
		
		condition.append(attributeContainer);
		condition.append(comparatorContainer);
		condition.append(valueContainer);
		
		return condition;
	}
	
	LAGVECondition.insertConditionChild = function(target,child) {
		if (target.hasClass('condition-child-container')) {
			if (!target.hasChildNodes()) {			
				target.append(child);				
			} else {
				//Y.log('LAGVECondition.insertConditionChild() didn\'t insert. Target had a child.');
			}
			
			LAGVECondition._positionChild(child);
			
		} else {
			//Y.log('LAGVECondition.insertConditionChild() didn\'t insert. Target wasn\'t a child container.');
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
		LAGVECondition.insertConditionChild(e.drop.get('node'),e.drag.get('node'))
		Y.log('LAGVECondition drop:enter');
	});
	
	Y.DD.DDM.on('drop:hit',function(e) {
		LAGVECondition.insertConditionChild(e.drop.get('node'),e.drag.get('node'));
		Y.log('LAGVECondition drop:hit');
	});
	
	Y.DD.DDM.on('drag:dropmiss',function(e) {
		LAGVECondition._positionChild(e.target.get('node'));
		Y.log('LAGVECondition drag:dropmiss');
	});
});