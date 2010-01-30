LAGVEActn = new Object();
LAGVEActn.scriptName = 'action.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVEActn.newAction = function(targetId) {
		var action 				= Y.Node.create( '<div class="action"></div>' );
		
		var attributeContainer	= Y.Node.create( '<div class="action-attribute-container action-child-container" title="Drop an attribute here."></div>' );
		var valueContainer		= Y.Node.create( '<div class="action-attribute-container action-child-container" title="Drop an attribute or value here."></div>' );
		var operatorContainer 	= Y.Node.create( '<div class="action-operator-container action-child-container" title="Select an operator from the list."></div>' );
		
		var attributeContainerDT	= new Y.DD.Drop({	node:	attributeContainer,
														groups:	['attribute'] });
		
		var valueContainerDT 		= new Y.DD.Drop({	node:	valueContainer,
														groups:	['attribute']  });
		
		attributeContainerDT.node	= attributeContainer;
		valueContainerDT.node		= valueContainer;
		
		var operatorSelect =  Y.Node.create( '<select class="operator-select">' +
											 '<option value="=">=</option>' +
											 '<option value="+=">+=</option>' +
											 '<option value="-=">-=</option>' +
											 '<option value=".=">.=</option>' +
											 '</select>');
		operatorContainer.append(operatorSelect);
		
		action.append(attributeContainer);
		action.append(operatorContainer);
		action.append(valueContainer);
		
		/*	if action will always be inside a statement li,
			action shouldn't be a drag becuase it will get dragged out of the li
		
		var actionDD =	new Y.DD.Drag({node:action})
		
		if (isset(targetId)) {
			actionDD.plug(	Y.Plugin.DDConstrained,
							{ constrain2node: '#' + targetId});
		}
		
		actionDD.node = action;*/
		
		if (isset(targetId)) {
			Y.one('#' + targetId).append(action);
		}
		
		return action;
	}
	
	
});