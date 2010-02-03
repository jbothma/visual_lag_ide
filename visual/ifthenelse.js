LAGVEIf = new Object();
LAGVEIf.scriptName = 'ifthenelse.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVEIf.newIf = function(targetNode) {
		var ifThenElse			= Y.Node.create('<div class="ifthenelse statement-child"></div>');
		var condCenteringOuter	= Y.Node.create('<div class="ifthenelse-condition-centering-outer"></div>');
		var condCenteringInner	= Y.Node.create('<div class="ifthenelse-condition-centering-inner"></div>');
		var ifDiamondIMG		= Y.Node.create('<img	alt="if-then-else diamond shape" \
														class="ifthenelse-diamond-image" \
														src="../visual/images/ifthenelse_diamond.png" >\
												</img>' );
		var conditionContainer 	= Y.Node.create('<div class="ifthenelse-condition-container selectable"></div>');
		var thenAndElse			= Y.Node.create('<div class="ifthenelse-thenelse"></div>');
		var thenBlock			= Y.Node.create('<div class="ifthenelse-then"></div>');
		thenBlock.append(LAGVEStmt.newStatement());
		var thenBlockTitle		= Y.Node.create('<div class="ifthenelse-then-title">THEN</div>');
		var elseBlock			= Y.Node.create('<div class="ifthenelse-else"></div>');
		elseBlock.append(LAGVEStmt.newStatement());
		var elseBlockTitle		= Y.Node.create('<div class="ifthenelse-else-title">ELSE</div>');		
		
		var conditionContainer		= Y.Node.create('<div class="ifthenelse-condition-container"></div>');
		var conditionContainerDrop	= new Y.DD.Drop({	node:	conditionContainer,
														groups:	['condition'] });
		
		/*	Node structure:
			
		ifThenElse
			condCenteringOuter
				condCenteringInner
					ifDiamondIMG
					conditionContainer
			thenAndElse
				thenBlock
					thenBlockTitle
				elseBlock
					elseBlockTitle
		*/
		ifThenElse.append(			condCenteringOuter	);
		condCenteringOuter.append(	condCenteringInner	);
		condCenteringInner.append(	ifDiamondIMG		);
		condCenteringInner.append(	conditionContainer	);
		ifThenElse.append(			thenAndElse			);
		thenAndElse.append(			thenBlock			);
		thenBlock.append(			thenBlockTitle		);
		thenAndElse.append(			elseBlock			);
		elseBlock.append(			elseBlockTitle		);
		
		if (isset(targetNode)) {
			targetNode.LAGVEInsert(ifThenElse);
		}
		
		return ifThenElse;
	}
	
	//Y.on('click',function() {LAGVEIf.newIf()});
});
		