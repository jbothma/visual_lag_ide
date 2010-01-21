/**
* Library for the LAG Attribute visual item
*/ 


YUI({
	filter:'min'
}).use('dd-drag','dd-drop','dd-proxy','node','event', function (Y) {

	/**
	 *
	 */
	function newAttrLevel(levelValue, isRoot, sublevel) {
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
		
		if (isset(isRoot) && isRoot) {
			new Y.DD.Drag({node: attrBox});
		}
		
		return attrBox;
	}
	
	Y.one('body').append(newAttrLevel('PM',true,newAttrLevel('Concept',false,newAttrLevel('visible'))));

	function newLAGAttr(levels) {
		rootAttrLevel = newAttrLevel(levels[0],true);
		
		for (var i = 1; i < levels.length; i++) {
			
			
			newAttrLevel(levels[i]);
		}
	}
		
});

