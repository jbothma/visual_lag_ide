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
var autoKeywords = ["initialization", 
                    "implementation", 
                    "while", "then", "else", "for", "if",
					"break", "do", "enough", "generalize", "specialize",
                    "GM", "UM", "DM", "PM", 
                    "true", "false",
                    "PM.todo", "PM.next", "PM.menu", 
                    "PM.GM", "PM.GM.Concept", "PM.GM.Concept.show",
                    "UM.GM", "UM.GM.Concept", "UM.GM.Concept.access", 
                    "UM.DM", "UM.DM.Concept", "GM.Concept", "GM.Concept.label",
                    "GM.Concept.weight", "DM.Concept", "DM.Concept.label", "DM.Concept.weight"];
