LAGVEIf = new Object();
LAGVEIf.scriptName = 'ifthenelse.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVEIf.newIf = function(targetNode) {
		var ifThenElse = Y.Node.create('<div id=' + Y.guid('ifthenelse-') + ' class="ifthenelse statement-child"></div>');
		ifThenElse._LAGVEName = 'If-Then-Else block';
		ifThenElse.getName = function() { return this._LAGVEName; }
		
		///////    IF    ////////
		ifThenElse.conditionPositioning	= Y.Node.create('<div class="ifthenelse-condition-positioning"></div>');
		ifThenElse.ifDiamondIMG			= Y.Node.create(
			'<img	alt="if-then-else diamond shape" \
					class="ifthenelse-diamond-image" \
					src="../visual/images/ifthenelse_diamond.png" >\
			</img>'
		);												
		ifThenElse.conditionContainer 	= Y.Node.create('<div id=' + Y.guid('condition-container-') + ' class="selectable ifthenelse-condition-container"></div>');
		var conditionContainerDrop		= new Y.DD.Drop({	
			node:	ifThenElse.conditionContainer,
			groups:	['condition'],
		});
		
		ifThenElse.conditionContainer.LAGVEInsert = function(child) {
			if (child.hasClass('condition')) {
				if (!ifThenElse.conditionContainer.hasChildNodes()) {			
					ifThenElse.conditionContainer.append(child);
				}
			}
		}
		
		ifThenElse.resize = function(reason) {
			Y.log('ifThenElse.resize triggered by ' + reason);
			// Setup
			var ifWidth			= parseInt(ifThenElse.conditionPositioning.getComputedStyle('width'));
			var thenWidth		= parseInt(ifThenElse.thenBlock.getComputedStyle('width'));
			var thenHMargins	= parseInt(ifThenElse.thenBlock.getStyle('marginLeft')) + 
									parseInt(ifThenElse.thenBlock.getStyle('marginRight'));
			var elseWidth		= parseInt(ifThenElse.elseBlock.getComputedStyle('width'));
			var elseHMargins	= parseInt(ifThenElse.elseBlock.getStyle('marginLeft')) + 
									parseInt(ifThenElse.elseBlock.getStyle('marginRight'));
			
			// Compute
			ifLeft				= thenWidth + thenHMargins - Math.floor(ifWidth/2);
			//plus 8 for the borders which can double in width because i can't be 
			//bothered to look them up scriptomatically right now
			ifThenElseWidth		= thenWidth + thenHMargins + elseWidth + elseHMargins +8;
			
			// Output
			ifThenElse.conditionPositioning.setStyle('left', ifLeft + 'px');
			ifThenElse.setStyle('width', ifThenElseWidth + 'px');
			
			// "bubble up"
			//if (ifThenElse.get('parentNode').resize) {
				ifThenElse.get('parentNode').resize('child ifThenElse.resize');
			//}
		}
		
		
		ifThenElse.thenAndElse = Y.Node.create('<div class="ifthenelse-thenelse"></div>');
		
		///////    THEN    ////////
		ifThenElse.thenBlock = Y.Node.create('<div class="ifthenelse-then"></div>');
		ifThenElse.thenStatementBlock = LAGVEStmt.newStatement();
		ifThenElse.thenStatementBlock.addClass('ifthenelse-then-statement');
		ifThenElse.thenStatementBlock.removeClass('deletable');
		ifThenElse.thenStatementBlock.resize = ifThenElse.resize;	// replace statement's resize()
		ifThenElse.thenBlock.append(ifThenElse.thenStatementBlock);
		ifThenElse.thenBlockTitle = Y.Node.create('<div class="ifthenelse-then-title">THEN</div>');
		
		///////    ELSE    ////////
		ifThenElse.elseBlock = Y.Node.create('<div class="ifthenelse-else"></div>');
		ifThenElse.elseStatementBlock = LAGVEStmt.newStatement();
		ifThenElse.elseStatementBlock.addClass('ifthenelse-else-statement');
		ifThenElse.elseStatementBlock.removeClass('deletable');
		ifThenElse.elseStatementBlock.resize = ifThenElse.resize;	// replace statement's resize()
		ifThenElse.elseBlock.append(ifThenElse.elseStatementBlock);
		ifThenElse.elseBlockTitle = Y.Node.create('<div class="ifthenelse-else-title">ELSE</div>');	
				
		/*	Node structure:
			
		ifThenElse
				ifThenElse.conditionPositioning
					ifDiamondIMG
					conditionContainer
			thenAndElse
				thenBlock
					thenBlockTitle
				elseBlock
					elseBlockTitle
		*/
		ifThenElse.append(						ifThenElse.conditionPositioning	);
		ifThenElse.conditionPositioning.append(	ifThenElse.ifDiamondIMG			);
		ifThenElse.conditionPositioning.append(	ifThenElse.conditionContainer	);
		ifThenElse.append(						ifThenElse.thenAndElse			);
		ifThenElse.thenAndElse.append(			ifThenElse.thenBlock			);
		ifThenElse.thenBlock.append(			ifThenElse.thenBlockTitle		);
		ifThenElse.thenAndElse.append(			ifThenElse.elseBlock			);
		ifThenElse.elseBlock.append(			ifThenElse.elseBlockTitle		);	
		
		if (isset(targetNode)) {
			targetNode.LAGVEInsert(ifThenElse);
			//ifThenElse.resize('new ifthenelse');
		}
		
		return ifThenElse;
	}
});
		