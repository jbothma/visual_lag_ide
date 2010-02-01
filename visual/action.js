LAGVEActn = new Object();
LAGVEActn.scriptName = 'action.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVEActn.newAction = function() {
		var action 				= Y.Node.create( '<div class="action deletable"></div>' );
		
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
											 '<option value="+=" title="Add to the current value">+=</option>' +
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
		
		/*if (isset(targetId)) {
			Y.one('#' + targetId).append(action);
		}*/
		
		return action;
	}
	
	LAGVEActn.insertActionChild = function(target,child) {
		if (target.hasClass('action-child-container')) {
			if (!target.hasChildNodes()) {			
				target.append(child);
				child.setStyle('position','relative');
				child.setStyle('left',0);
				child.setStyle('top',0);
			} else {
				Y.log('LAGVEActn.insertActionChild() didn\'t insert. Target had a child.');
			}
		} else {
			Y.log('LAGVEActn.insertActionChild() didn\'t insert. Target wasn\'t a child container.');
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
});