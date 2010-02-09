LAGVEActn = new Object();
LAGVEActn.scriptName = 'action.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVEActn.newAction = function(targetNode) {
		//////    ACTION    //////
		var action 			= Y.Node.create( '<div class="action statement-child"></div>' );
		action.resize 		= function(reason) {
			//Y.log('action.resize triggered by ' + reason);
			// Setup
			var attributeContainerWidth	= parseInt(this.attributeContainer.getComputedStyle('width'));
			var valueContainerWidth		= parseInt(this.valueContainer.getComputedStyle('width'));
			var operatorContainerWidth	= parseInt(this.operatorContainer.getComputedStyle('width'));
						
			// Compute
			actionWidth					= attributeContainerWidth + operatorContainerWidth + valueContainerWidth + 22;
			
			// Output
			this.setStyle('width', actionWidth + 'px');
			
			// Bubble
			this.get('parentNode').resize('action.resize | ' + reason);
		}
		action._LAGVEName 	= 'Action';
		action.getName		= function() { return this._LAGVEName };
		
		//////    ATTRIBUTE CONTAINER    //////
		action.attributeContainer			= Y.Node.create('\
			<div	class="action-attribute-container action-child-container selectable" \
					\title="Drop an attribute here."></div>\
		');
		action.attributeContainer._LAGVEName	= 'Action attribute';
		action.attributeContainer.select 		= LAGVE._genericSelect;
		action.attributeContainer.deSelect 	= LAGVE._genericDeSelect;
		action.attributeContainer.LAGVEInsert	= function(node) {
			if (LAGVEActn.tryInsertActionChild(action.attributeContainer,node)) {
				node.resize('action.attributeContainer.LAGVEInsert');
			}
		};
		action.attributeContainer.getName		= function() { return this._LAGVEName };
		action.attributeContainer.resize 		= function() { 
			action.resize('child action.attributeContainer.resize | ' + reason) 
		};
		new Y.DD.Drop({
			node:		action.attributeContainer,
			groups:		['attribute'],
		});
		
		
		//////    VALUE CONTAINER    //////
		action.valueContainer				= Y.Node.create('\
			<div class="action-attribute-container action-child-container selectable" \
			title="Drop an attribute or value here."></div>\
		');
		action.valueContainer._LAGVEName	= 'Action value';
		action.valueContainer.select 		= LAGVE._genericSelect;
		action.valueContainer.deSelect 	= LAGVE._genericDeSelect;
		action.valueContainer.resize 		= function() { 
			action.resize('child action.valueContainer.resize | ' + reason);
		};
		new Y.DD.Drop({
			node:	action.valueContainer,
			groups:	['attribute'],
		});
		action.valueContainer.LAGVEInsert		= function(node) {
			if (LAGVEActn.tryInsertActionChild(action.valueContainer,node)) {
				node.resize('action.valueContainer.LAGVEInsert');
			}
		};
		action.valueContainer.getName			= function() { return this._LAGVEName };
		
		
		//////    OPERATOR CONTAINER    //////
		action.operatorContainer 		= Y.Node.create('\
			<div class="action-operator-container action-child-container" \
			title="Select an operator from the list."></div>\
		');
		action.operatorSelect =  Y.Node.create( '<select class="operator-select">' +
											 '<option value="=">=</option>' +
											 '<option value="+=" title="Add to the current value">+=</option>' +
											 '<option value="-=">-=</option>' +
											 '<option value=".=">.=</option>' +
											 '</select>');
		action.operatorContainer.append(action.operatorSelect);
		
		
		//////      BUILD AND INSERT/RETURN    //////
		action.append(action.attributeContainer);
		action.append(action.operatorContainer);
		action.append(action.valueContainer);
				
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
					target.resize('LAGVEActn.tryInsertActionChild');
					return true;
				}
		
				LAGVEActn._positionChild(child);
			}
		}
		return false;
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