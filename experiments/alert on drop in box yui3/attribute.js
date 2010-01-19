function init() {
	YUI({
		filter:'min'
	}).use('dd-drag','dd-drop','dd-proxy','node','event', function (Y) {

		function newAttr() {
			var attrBox = Y.Node.create('<div class="attr_box"></div>');
			var attrBoxValue = Y.Node.create('<div class="attr_box_value">bob</div>');
			var subLevelContainer = Y.Node.create('<div class="sub_level_container"></div>');
			
			attrBox.append(attrBoxValue);
			attrBox.append(subLevelContainer);
			
			new Y.DD.Drag({node: attrBox});
			
			Y.one('body').append(attrBox);
		}
		
		newAttr();
	});
}
	