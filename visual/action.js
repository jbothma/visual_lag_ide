LAGVEActn = new Object();
LAGVEActn.scriptName = 'action.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVEActn.newAction = function(targetNode) {
		var action 				= Y.Node.create( '<div class="action statement-child"></div>' );
		action.LAGVEName = 'Action';
		
		var attributeContainer	= Y.Node.create( '<div class="action-attribute-container action-child-container selectable" title="Drop an attribute here."></div>' );
		attributeContainer.LAGVEName = 'Attribute position';
		
		var valueContainer		= Y.Node.create( '<div class="action-attribute-container action-child-container selectable" title="Drop an attribute or value here."></div>' );
		valueContainer.LAGVEName = 'Value position';
		
		var operatorContainer 	= Y.Node.create( '<div class="action-operator-container action-child-container" title="Select an operator from the list."></div>' );
		
		var attributeContainerDT	= new Y.DD.Drop({	node:	attributeContainer,
														groups:	['attribute'] });
		
		var valueContainerDT 		= new Y.DD.Drop({	node:	valueContainer,
														groups:	['attribute']  });
		
		attributeContainerDT.node	= attributeContainer;
		valueContainerDT.node		= valueContainer;
		
		attributeContainer.LAGVEInsert	= function(node) {LAGVEActn.insertActionChild(attributeContainer,node)};
		valueContainer.LAGVEInsert		= function(node) {LAGVEActn.insertActionChild(valueContainer,node)};
		
		var operatorSelect =  Y.Node.create( '<select class="operator-select">' +
											 '<option value="=">=</option>' +
											 '<option value="+=" title="Add to the current value">+=</option>' +
											 '<option value="-=">-=</option>' +
											 '<option value=".=">.=</option>' +
											 '</select>');
		operatorContainer.append(operatorSelect);
		
		action.append(attributeContainer);
		action.append(operatorContainer);
		action.append(valueContainer);
		
		if (isset(targetNode)) {
			targetNode.LAGVEInsert(action);
		}
		
		return action;
	}
	
	LAGVEActn.insertActionChild = function(target,child) {
		if (child.hasClass('action-child')) {
			if (target.hasClass('action-child-container')) {
				if (!target.hasChildNodes()) {			
					target.append(child);				
				} else {
					//Y.log('LAGVEActn.insertActionChild() didn\'t insert. Target had a child.');
				}
				
				LAGVEActn._positionChild(child);
				
			} else {
				//Y.log('LAGVEActn.insertActionChild() didn\'t insert. Target wasn\'t a child container.');
			}
		} else {
			//alert(child.LAGVEName + ' can not be inserted into a ' + target.LAGVEName + '.');
			Y.log(child.LAGVEName + ' can not be inserted into a ' + target.LAGVEName + '.');
		}
	}
	
	LAGVEActn._positionChild = function(child) {
		if (child.hasClass('action-child')) {
			child.setStyles({	position:	'relative',
								left:		'0px',
								top:		'0px'});
		}
	}
	
	Y.DD.DDM.on('drop:enter',function(e) {
		LAGVEActn.insertActionChild(e.drop.get('node'),e.drag.get('node'))
		//Y.log('drop:enter');
	});
	
	Y.DD.DDM.on('drop:hit',function(e) {
		LAGVEActn.insertActionChild(e.drop.get('node'),e.drag.get('node'));
		//Y.log('drop:hit');
	});
	
	Y.DD.DDM.on('drag:dropmiss',function(e) {
		LAGVEActn._positionChild(e.target.get('node'));
	});
});