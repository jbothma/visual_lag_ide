LAGVEActn = new Object();
LAGVEActn.scriptName = 'action.html';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
	

	//Listen for all drag:drophit events
	Y.DD.DDM.on('drop:hit', function(e) {
		if (isset(e.drag.attribute) && isset(e.drop.attributeContainer)) {
			e.drop.attributeContainer.append(e.drag.attribute);
			e.drag.attribute.addClass('child-of-action');
			e.drag.attribute.setStyle('left',0);
			e.drag.attribute.setStyle('top',0);
		}
	});
	
	
	LAGVEActn.newAction = function(targetId) {
		var action = LAGVECon.newConnectable('workspace');
		
		var attributeContainer	= Y.Node.create( '<div class="action-attribute-container action-container"></div>' );
		var operatorContainer 	= Y.Node.create( '<div class="action-operator-container action-container"></div>' );
		var valueContainer 		= Y.Node.create( '<div class="action-value-container action-container">v</div>' );
		
		var attributeContainerDT = new Y.DD.Drop({ node: attributeContainer });
		
		attributeContainerDT.attributeContainer = attributeContainer;

		/**
		 * Given a Node, attributeContainer will receive it as a child
		 */
		attributeContainer.catch = function(e) {
			
			var x = 1;
			//this.append(attribute);
		}
		
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
	}
});