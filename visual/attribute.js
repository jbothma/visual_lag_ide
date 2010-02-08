/**
 *	LAGVEAttr
 *
 *	Library for the LAG Visual Editor Attribute item
 */ 

var LAGVEAttr = new Object();
LAGVEAttr.scriptName = 'attribute.js';

getMyY().use('dd-constrain','node','event', function (Y) {

	/**
	 *
	 */
	LAGVEAttr.newAttrLevel = function(levelValue, isRoot, sublevel) {
		var attrBox = Y.Node.create('<div class="attr_box"></div>');
		var attrBoxValue = Y.Node.create('<div class="attr_box_value">' + levelValue + '</div>');
		var subLevelContainer = Y.Node.create('<div class="sub_level_container"></div>');
		
		attrBox.append(attrBoxValue);
		attrBox.append(subLevelContainer);
		
		attrBox.valueDiv = attrBoxValue;
		attrBox.subLevelContainer = subLevelContainer;
		
		attrBox.addSubLevel = function(attrLevel) {
			attrLevel.addClass('sub_level');
			this.subLevelContainer.append(attrLevel);
		}
		
		if (isset(sublevel)) {
			attrBox.addSubLevel(sublevel);
		}
		
		return attrBox;
	}
	

	/**
	 *	insertNewAttr(['PM','GM','accessed'],'visual-editing-workspace')
	 *  would append PM.GM.accessed to the element 
	 *	with id visual-editing-workspace
	 */
	LAGVEAttr.insertNewAttr = function(levels,targetNode) {
		var lowestAttrLevel;
		
		/*	create attribute levels in reverse
		 *	e.g. for PM.GM.visible
		 *	make visible, then make GM and insert visible to it, 
		 *	then make PM and insert GM.visible into it. */
		for (var i = levels.length-1; i >= 0; i--) {
			lowestAttrLevel = LAGVEAttr.newAttrLevel(levels[i],false,lowestAttrLevel);
		}
		
		var newAttribute = lowestAttrLevel;
		newAttribute._LAGVEName = 'Attribute/Value';
		newAttribute.getName = function() { return this._LAGVEName }
		
		// make the root attribute level box dragable
		var attributeDD = new Y.DD.Drag({	node:	newAttribute,
											groups:	['attribute'] });
		
		//constrain attributes to their initial target for now.
		//TODO: should prob be a sparate parameter once attributes 
		//can be inserted in context.
		/*attributeDD.plug(	Y.Plugin.DDConstrained,
							{ constrain2node: Y.one('body') } );*/
																				
		newAttribute.addClass('deletable');
		newAttribute.addClass('action-child');
		newAttribute.addClass('comparison-child');
		
		// Default to selected node.
		if (!isset(targetNode)) {
			targetNode = LAGVE.selectedNode;
		}
		
		if (isset(targetNode)) {
			targetNode.LAGVEInsert(newAttribute);
		} 
		
		return newAttribute;
	}
});
