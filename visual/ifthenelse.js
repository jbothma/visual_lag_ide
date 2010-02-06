LAGVEIf = new Object();
LAGVEIf.scriptName = 'ifthenelse.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVEIf.newIf = function(targetNode) {
		var ifThenElse			= Y.Node.create('<div class="ifthenelse statement-child"></div>');
		
		///////    IF    ////////
		var condCenteringOuter	= Y.Node.create('<div class="ifthenelse-condition-centering-outer"></div>');
		var condCenteringInner	= Y.Node.create('<div class="ifthenelse-condition-centering-inner"></div>');
		var ifDiamondIMG		= Y.Node.create('<img	alt="if-then-else diamond shape" \
														class="ifthenelse-diamond-image" \
														src="../visual/images/ifthenelse_diamond.png" >\
												</img>' );												
		var conditionContainer 	= Y.Node.create('<div class="selectable ifthenelse-condition-container"></div>');
		var conditionContainerDrop	= new Y.DD.Drop({	node:	conditionContainer,
														groups:	['condition'] });
		conditionContainer.LAGVEInsert = function(child) {
			if (child.hasClass('condition')) {
				if (!conditionContainer.hasChildNodes()) {			
					conditionContainer.append(child);				
				}
			} 
		}
		
		thenAndElse			= Y.Node.create('<div class="ifthenelse-thenelse"></div>');
		
		///////    THEN    ////////
		var thenBlock			= Y.Node.create('<div class="ifthenelse-then"></div>');
		var thenStatementBlock	= LAGVEStmt.newStatement();
		thenStatementBlock.addClass('ifthenelse-then-statement');
		thenStatementBlock.removeClass('deletable');
		thenBlock.append(thenStatementBlock);
		var thenBlockTitle		= Y.Node.create('<div class="ifthenelse-then-title">THEN</div>');
		
		///////    ELSE    ////////
		var elseBlock			= Y.Node.create('<div class="ifthenelse-else"></div>');
		var elseStatementBlock	= LAGVEStmt.newStatement();
		elseStatementBlock.addClass('ifthenelse-else-statement');
		elseStatementBlock.removeClass('deletable');
		elseBlock.append(elseStatementBlock);
		var elseBlockTitle		= Y.Node.create('<div class="ifthenelse-else-title">ELSE</div>');		
				
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
		