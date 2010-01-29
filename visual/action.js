LAGVEActn = new Object();
LAGVEActn.scriptName = 'action.html';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
	

	//Listen for all drag:drophit events
	Y.DD.DDM.on('drop:hit', function(e) {
		if (isset(e.drag.attribute) && isset(e.drop.attributeContainer)) {
			e.drop.attributeContainer.catch(e.drag.attribute);
		}
	});
	
	
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

		/**
		 * Given a Node, attributeContainer will receive it as a child
		 */
		attributeContainer.catch = function(attribute) {
			this.append(attribute);
			attribute.addClass('action-child');
			attribute.setStyle('left',0);
			attribute.setStyle('top',0);
		}
		
		valueContainer.catch = attributeContainer.catch;
		
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
		
		var actionDD =	new Y.DD.Drag({node:action}).plug(	Y.Plugin.DDConstrained,
															{ constrain2node: '#' + targetId});
		actionDD.node = action;
		
		Y.one('#' + targetId).append(action);
		
		return action;
	}
	
	
});