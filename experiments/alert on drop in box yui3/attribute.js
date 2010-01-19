function init() {
	YUI({
		filter:'min'
	}).use('dd-drag','dd-drop','dd-proxy','node','event', function (Y) {

		function newAttrBox() {
			var attrBox = Y.Node.create('<div class="attrBox"></div>');
		}
	});
}
	