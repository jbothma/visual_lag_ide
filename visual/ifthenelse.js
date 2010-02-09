LAGVEIf = new Object();
LAGVEIf.scriptName = 'ifthenelse.js';

getMyY().use('dd-drag','dd-proxy','dd-drop','node','event', function (Y) {
		
	LAGVEIf.newIf = function(targetNode) {
		////////     IF-THEN-ELSE     /////////
		var ifThenElse 			= Y.Node.create('<div id=' + Y.guid('ifthenelse-') + ' class="ifthenelse statement-child"></div>');
		ifThenElse._LAGVEName	= 'If-Then-Else block';
		ifThenElse.getName		= function() { return this._LAGVEName; }
		
		/**
		 *
		 */
		ifThenElse.resize = function(reason) {
			//Y.log('ifThenElse.resize triggered by ' + reason);
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
			ifThenElseWidth		= thenWidth + thenHMargins + elseWidth + elseHMargins + 12;
			
			// Output
			ifThenElse.conditionPositioning.setStyle('left', ifLeft + 'px');
			ifThenElse.setStyle('width', ifThenElseWidth + 'px');
			
			ifThenElse.get('parentNode').resize('ifThenElse.resize | ' + reason);
		}
		
		
		///////    IF    ////////
		ifThenElse.conditionPositioning			= Y.Node.create('<div class="ifthenelse-condition-positioning selectable"></div>');
		ifThenElse.conditionPositioning.select 	= function() {
			ifThenElse.conditionPositioning.get('children').filter('.ifthenelse-diamond-image').setStyle('visibility','hidden');
			ifThenElse.conditionPositioning.get('children').filter('.ifthenelse-diamond-image-selected').setStyle('visibility','visible');
		};
		ifThenElse.conditionPositioning.deSelect 	= function() {
			ifThenElse.conditionPositioning.get('children').filter('.ifthenelse-diamond-image-selected').setStyle('visibility','hidden');
			ifThenElse.conditionPositioning.get('children').filter('.ifthenelse-diamond-image').setStyle('visibility','visible');
		};
		ifThenElse.conditionPositioning.LAGVEInsert = function(child) {
			ifThenElse.conditionContainer.LAGVEInsert(child);
		};
		ifThenElse.conditionPositioning.resize = function(reason) {
			Y.log('ifThenElse.conditionPositioning.resize triggered by ' + reason);
			// Setup
			var attributeContainerWidth	= parseInt(ifThenElse.conditionContainer.getComputedStyle('width'));
						
			// Compute
			conditionPositioningWidth				= attributeContainerWidth * 1.5;
			
			// Output
			this.setStyle('width', conditionPositioningWidth + 'px');
			
			// Bubble
			this.get('parentNode').resize('child action.resize | ' + reason);
		}
		
		ifThenElse.arrows				= Y.Node.create('<div class="ifthenelse-arrows"></div>');
		ifThenElse.arrowheadLeft		= Y.Node.create('<div class="ifthenelse-arrowhead-left"></div>');
		ifThenElse.arrowheadRight		= Y.Node.create('<div class="ifthenelse-arrowhead-right"></div>');
		ifThenElse.ifDiamondIMG			= Y.Node.create(
			'<img	alt="if-then-else diamond shape" \
			class="ifthenelse-diamond-image" \
			src="../visual/images/ifthenelse_diamond.png" ></img>\
		');	
		ifThenElse.ifDiamondIMGSelected			= Y.Node.create(
			'<img	alt="if-then-else diamond shape selected" \
					class="ifthenelse-diamond-image-selected" \
					src="../visual/images/ifthenelse_diamond_selected.png" >\
			</img>'
		);
		
		ifThenElse.conditionContainer 			= Y.Node.create('\
			<ul id=' + Y.guid('condition-container-') + ' \
			class="ifthenelse-condition-container"></ul>\
		');
		ifThenElse.conditionContainer.plug(
			Y.Plugin.Drop,
			{
				groups:	['condition'],
			}
		);		
		ifThenElse.conditionContainer.resize 		= function(reason) {
			ifThenElse.resize('ifThenElse.conditionContainer.resize | ' + reason);
		};
		ifThenElse.conditionContainer.LAGVEInsert	= function(child) {
			if (child.hasClass('condition')) {
				if (!ifThenElse.conditionContainer.hasChildNodes()) {			
					ifThenElse.conditionContainer.append(child);
					child.parentChanged();
					child.resize();
				}
			}
		}
		
		
		///////    THEN and ELSE    ///////
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
					arrows
						arrowhead left
						arrowhead right
					ifDiamondIMG
					ifDiamondIMGSelected
					conditionContainer
			thenAndElse
				thenBlock
					thenBlockTitle
				elseBlock
					elseBlockTitle
		*/
		ifThenElse.append(						ifThenElse.conditionPositioning	);
		ifThenElse.arrows.append(				ifThenElse.arrowheadLeft		);
		ifThenElse.arrows.append(				ifThenElse.arrowheadRight		);
		ifThenElse.conditionPositioning.append(	ifThenElse.arrows				);
		ifThenElse.conditionPositioning.append(	ifThenElse.ifDiamondIMG			);
		ifThenElse.conditionPositioning.append(	ifThenElse.ifDiamondIMGSelected	);
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
		