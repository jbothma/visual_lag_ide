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

// This object returns the type of keyword and the CSS styling
function typeOfKeyword(type, style){
  return {type: type, style: style};
}

var trueFalse = typeOfKeyword("trueFalse", "lag-keyword4");		// true, false
var stat = typeOfKeyword("stat", "lag-keyword5");				// generalize, specialize, generalise, specialise
var model = typeOfKeyword("model", "lag-keyword6");				// DM, GM, UM, PM, CM, Concept

var LAGkeywords = {
	"initialization": typeOfKeyword("init", "lag-keyword1"),
	"implementation": typeOfKeyword("impl","lag-keyword1"),
	"if": typeOfKeyword("if", "lag-keyword2"),
	"while": typeOfKeyword("while", "lag-keyword2"),
	"then": typeOfKeyword("then", "lag-keyword3"),
	"else": typeOfKeyword("else", "lag-keyword3"),
	"do": typeOfKeyword("do", "lag-keyword3"),
	"for": typeOfKeyword("for", "lag-keyword7"),
	"enough": typeOfKeyword("enough", "lag-keyword7"),
	"break": typeOfKeyword("break", "lag-keyword7"),
	"true": trueFalse,										// see above
	"false": trueFalse,
	"generalize": stat, "specialize": stat,					// see above
	"DM": model,											// see above
	"GM": model,
	"UM": model,
	"PM": model,
	"CM": model,
	"Concept": model
};