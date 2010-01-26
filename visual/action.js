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
		var action = LAGVECon.newConnectable(targetId);
		
		action.addClass('action');
		
		var attributeContainer	= Y.Node.create( '<div class="action-attribute-container action-child-container"></div>' );
		var valueContainer		= Y.Node.create( '<div class="action-attribute-container action-child-container"></div>' );
		var operatorContainer 	= Y.Node.create( '<div class="action-operator-container action-child-container"></div>' );
		
		var attributeContainerDT	= new Y.DD.Drop({ node: attributeContainer });
		var valueContainerDT 		= new Y.DD.Drop({ node: valueContainer });
		
		attributeContainerDT.attributeContainer	= attributeContainer;
		valueContainerDT.attributeContainer		= valueContainer;

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
	}
});