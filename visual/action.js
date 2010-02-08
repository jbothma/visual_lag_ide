LAGVEActn = new Object();
LAGVEActn.scriptName = 'action.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVEActn.newAction = function(targetNode) {
		var action 				= Y.Node.create( '<div class="action statement-child"></div>' );
		action._LAGVEName 		= 'Action';
		
		var attributeContainer		= Y.Node.create( '<div class="action-attribute-container action-child-container selectable" title="Drop an attribute here."></div>' );
		attributeContainer._LAGVEName= 'Attribute position';
		
		var valueContainer			= Y.Node.create( '<div class="action-attribute-container action-child-container selectable" title="Drop an attribute or value here."></div>' );
		valueContainer._LAGVEName	= 'Value position';
		
		var operatorContainer 	= Y.Node.create( '<div class="action-operator-container action-child-container" title="Select an operator from the list."></div>' );
		
		var attributeContainerDT	= new Y.DD.Drop({
			node:		attributeContainer,
			groups:		['attribute'],
		});
		
		var valueContainerDT 		= new Y.DD.Drop({
			node:	valueContainer,
			groups:	['attribute'],
		});
		
		attributeContainerDT.node	= attributeContainer;
		valueContainerDT.node		= valueContainer;
		
		action.resize 					= function()	 {this.get('parentNode').resize('child action.resize')};
		action.getName					= function()	 {return this._LAGVEName};
		attributeContainer.LAGVEInsert	= function(node) {LAGVEActn.tryInsertActionChild(attributeContainer,node)};
		attributeContainer.getName		= function()	 {return this._LAGVEName};
		valueContainer.LAGVEInsert		= function(node) {LAGVEActn.tryInsertActionChild(valueContainer,node)};
		valueContainer.getName			= function()	 {return this._LAGVEName};
		
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
	
	LAGVEActn.tryInsertActionChild = function(target,child) {
		if (target.hasClass('action-child-container')) {
			if (child.hasClass('action-child')) {
				if (!target.hasChildNodes()) {			
					target.append(child);				
				}
		
				LAGVEActn._positionChild(child);
			}
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
		LAGVEActn.tryInsertActionChild(e.drop.get('node'),e.drag.get('node'));
	});
	
	Y.DD.DDM.on('drop:hit',function(e) {
		LAGVEActn.tryInsertActionChild(e.drop.get('node'),e.drag.get('node'))
	});
	
	Y.DD.DDM.on('drag:dropmiss',function(e) {
		if (e.target.get('node').hasClass('action-child')) {
			LAGVEActn._positionChild(e.target.get('node'));
		}
	});
});