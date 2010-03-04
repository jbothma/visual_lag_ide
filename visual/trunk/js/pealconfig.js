/** Variables for the Strategy Wizard **/
/*

PM
    .todo, .next, .menu
    .GM.Concept.show (set to true /false to show/hide concept)
UM
    .GM.some_name (free user model variables for this GM)
    .DM.concept.some_dame (domain overlay variables)
    .GM.concept.some_dame (domain overlay variables)
    .GM.Concept.access (has the concept been accessed)
GM (or DM)
    .Concept.label (label of concept)
    .Concept.weight (weight of concept)
	
*/

var wizardMenu =[
			[ "PM",
			  ["todo", "next", "menu", "GM"],
			  [[    ],	[   ], 	[   ], 	["Concept"]],
			  [[[]  ], 	[[] ], 	[[] ], 	[["show"]] ]
			],
			
			[ "UM",
			  ["GM", 				"DM"],
			  [["", "Concept"     ], ["Concept"]],
			  [[[], ["access"]],     [[]]       ]
			],
			
			[ "GM",
			  ["Concept"          ],
			  [["label", "weight"]],
			  [[[]     , []      ]]
			],
			
			[ "DM",
			  ["Concept"          ],
			  [["label", "weight"]],
			  [[[]     , []      ]]			
			]
		];

/** Words for the autocomplete **/
var autoKeywords = ["initialization", "implementation", "while", "then", "else", "for", "if",
						"break", "do", "true", "false", "enough", "generalize", "specialize",
						"GM", "UM", "DM", "PM", "PM.todo", "PM.next", "PM.menu", "PM.GM", "PM.GM.Concept", "PM.GM.Concept.show",
						"UM.GM", "UM.GM.Concept", "UM.GM.Concept.access", "UM.DM", "UM.DM.Concept", "GM.Concept", "GM.Concept.label",
						"GM.Concept.weight", "DM.Concept", "DM.Concept.label", "DM.Concept.weight"];

/** Language definition **/
//
// The first section is for use in the tokenizer.
// For each token, an object called "typeOfKeyword" is required stating the
// name for that token and the CSS styling you want to use for every occurence
// of that keyword in the code.
//
// Currently the parser only knows of the keyword types as listed below.
// For reference: trueFalse, stat, model, init, impl, if, while, then, else, do, for, enough, break
// And a few general others: compare, operator, variable, number, whitespace, comment
//

