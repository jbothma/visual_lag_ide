/**
 * Library for the LAG Attribute visual item
 */ 

function init() {
	YUI({
		filter:'min'
	}).use('dd-drag','dd-drop','dd-proxy','node','event', function (Y) {

		function newAttrLevel(levelValue) {
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
			
			//new Y.DD.Drag({node: attrBox});
			
			return attrBox;
		}
		
		function addRootAttrLevel() {
			Y.one('body').append(newAttrLevel());
		}
		
		//root
		var rootLevel = newAttrLevel('PM');
		//sub secondary
		var secondaryLevel = newAttrLevel('Concept');
		rootLevel.addSubLevel(secondaryLevel);
		//sub final
		var finalLevel = newAttrLevel('visible');
		secondaryLevel.addSubLevel(finalLevel);
		//add to body
		Y.one('body').append(rootLevel);
		//make root tragable
		new Y.DD.Drag({node: rootLevel});
	});
}
	