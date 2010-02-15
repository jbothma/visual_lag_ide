/* Tokenizer for LAG code */

var tokenizeLAG = (function() {
  // Advance the stream until the given character (not preceded by a
  // backslash) is encountered, or the end of the line is reached.
  function nextUntilUnescaped(source, end, result){
    var escaped = false;
    var next;
    while(!source.endOfLine()){
      var next = source.next();
      if (next == end && !escaped)
        break;
      escaped = next == "\\";
    }
    return result;
  }

  // A map of LAG's keywords. The a/b/c keyword distinction is
  // very rough, but it gives the parser enough information to parse
  // correct code correctly (we don't care that much how we parse
  // incorrect code). The style information included in these objects
  // is used by the highlighter to pick the correct CSS style for a
  // token.
  var keywords = function(){
    /*function typeOfKeyword(type, style){
      return {type: type, style: style};
    }
	//var initImpl = typeOfKeyword("initImpl", "lag-keyword1");	// initialization, implementation
	//var keywordA = typeOfKeyword("keyword a", "lag-keyword2");	// if, while
	//var keywordB = typeOfKeyword("keyword b", "lag-keyword3");	// then, else, do
	//var keywordC = typeOfKeyword("keyword c", "lag-keyword7");	// for, enough, break
	*/
	/*
	var trueFalse = typeOfKeyword("trueFalse", "lag-keyword4");	// true, false
	var stat = typeOfKeyword("stat", "lag-keyword5");			// genstat, specstat
	var model = typeOfKeyword("model", "lag-keyword6");		// DM, GM, UM, PM, CM
	*/
	return LAGkeywords; /*{
		"initialization": typeOfKeyword("init", "lag-keyword1"), "implementation": typeOfKeyword("impl","lag-keyword1"),
		"if": typeOfKeyword("if", "lag-keyword2"), "while": typeOfKeyword("while", "lag-keyword2"),
		"then": typeOfKeyword("then", "lag-keyword3"), "else": typeOfKeyword("else", "lag-keyword3"), "do": typeOfKeyword("do", "lag-keyword3"),
		"true": trueFalse, "false": trueFalse,
		"for": typeOfKeyword("for", "lag-keyword7"),
		"enough": typeOfKeyword("enough", "lag-keyword7"),
		"break": typeOfKeyword("break", "lag-keyword7"),
		"generalize": stat, "specialize": stat,
		"generalise": stat, "specialise": stat,
		"DM": model, "GM": model, "UM": model, "PM": model, "CM": model, "Concept": model
	}; */
  }();

  // Some helper regexp matchers.
  var isOperatorCompareChar = matcher(/!|=|\+|\.|-|i|<|>/);
  var isOperator = matcher(/=|\.=|\+=|-=/);					// matches =  +=  -=  .=
  var isCompare = matcher(/!=|==|<=|<|>=|>|\b(in)\b/);		// matches ==  <  >  in != >= <=	a lookahead just helps matching.. the character in the lookahead isnt matched...
  var isDigit = matcher(/[0-9]/);
  var isHexDigit = matcher(/[0-9A-Fa-f]/);
  var isWordChar = matcher(/[\w\$_]/);

  // Wrapper around jsToken that helps maintain parser state (whether
  // we are inside of a multi-line comment and whether the next token
  // could be a regular expression).
  function lagTokenState(inComment, regexp) {
    return function(source, setState) {
      var newInComment = inComment;
      var type = lagToken(inComment, regexp, source, function(c) {newInComment = c;});
      var newRegexp = type.type == "operator" || type.type == "keyword c" || type.type.match(/^[\[{}\(,;:]$/);
      if (newRegexp != regexp || newInComment != inComment)
        setState(lagTokenState(newInComment, newRegexp));
      return type;
    };
  }

  // The token reader, inteded to be used by the tokenizer from
  // tokenize.js (through lagTokenState). Advances the source stream
  // over a token, and returns an object containing the type and style
  // of that token.
  function lagToken(inComment, regexp, source, setComment) {
    function readHexNumber(){
      source.next(); // skip the 'x'
      source.nextWhile(isHexDigit);
      return {type: "number", style: "lag-atom"};
    }

    function readNumber() {
      source.nextWhile(isDigit);
      if (source.equals(".")){
        source.next();
        source.nextWhile(isDigit);
      }
      if (source.equals("e") || source.equals("E")){
        source.next();
        if (source.equals("-"))
          source.next();
        source.nextWhile(isDigit);
      }
      return {type: "number", style: "lag-atom"};
    }
	
    // Read a word, look it up in keywords. If not found, it is a
    // variable, otherwise it is a keyword of the type found.
    function readWord() {
      source.nextWhile(isWordChar);
      var word = source.get();
      var known = keywords.hasOwnProperty(word) && keywords.propertyIsEnumerable(word) && keywords[word];
      return known ? {type: known.type, style: known.style, content: word} :
      {type: "variable", style: "lag-variable", content: word};
    }
    function readRegexp() {
      nextUntilUnescaped(source, "/");
      source.nextWhile(matcher(/[gi]/));
      return {type: "regexp", style: "lag-string"};
    }
	
    // Mutli-line comments are tricky. We want to return the newlines
    // embedded in them as regular newline tokens, and then continue
    // returning a comment token for every line of the comment. So
    // some state has to be saved (inComment) to indicate whether we
    // are inside a /* */ sequence.
    function readMultilineComment(start){
      var newInComment = true;
      var maybeEnd = (start == "*");
      while (true) {
        if (source.endOfLine())
          break;
        var next = source.next();
        if (next == "/" && maybeEnd){
          newInComment = false;
          break;
        }
        maybeEnd = (next == "*");
      }
      setComment(newInComment);
      return {type: "comment", style: "lag-comment"};
    }
    function readOperator() {
      source.nextWhile(isOperator);
      return {type: "operator", style: "lag-operator"};
    }
	function readCompare() {
	  source.nextWhile(isCompare);
	  return {type: "compare", style: "lag-compare"};
	}

    // Fetch the next token. Dispatches on first character in the
    // stream, or first two characters when the first is a slash.
    var ch = source.next();
    if (inComment) {
      return readMultilineComment(ch);
    } else if (ch == "\"" || ch == "'") {
      return nextUntilUnescaped(source, ch, {type: "string", style: "lag-string"});
    // with punctuation, the type of the token is the symbol itself
    } else if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
		if (ch == "." && source.peek() == "=") {
			source.next();
			return {type: "operator", style: "lag-operator"};
		} else {
			return {type: ch, style: "lag-punctuation"};
		}
    } else if (ch == "0" && (source.equals("x") || source.equals("X"))) {
      return readHexNumber();
    } else if (isDigit(ch)) {
      return readNumber();
    } else if (ch == "/") {
      if (source.equals("*"))
      { source.next(); return readMultilineComment(ch); }
      else if (source.equals("/"))
        return nextUntilUnescaped(source, null, {type: "comment", style: "lag-comment"});
      else if (regexp)
        return readRegexp();
      else
        return readOperator();
    }
	// Is ch an operator or compare character?
	// Consume the next character
	// Run regexp checks on the two-character string
	// Return type or return word
	else if (isOperatorCompareChar(ch)) {
		var a = ch;
		// Don't consume it yet otherwise we end up with tokens with extra spaces.. namely for the chars "i" and "="
		var b = source.peek();

		// If it is whitespace, ignore it
		// Code borrowed from isWhiteSpace in tokenize.js
		if (b == "\n" || /^[\s\u00a0]*$/.test(b)) {
			b="";
		// If we're not going to ignore it, consume it
		} else {
			source.next();
		}
		var tmp = a+b;
		if (tmp == "==" || tmp == "!=") {
			return {type: "compare", style: "lag-compare"};
		} else if (isCompare(tmp)) {
			if (tmp == "in" && !source.equals(" ")) {
				return readWord();
			} else {
				return {type: "compare", style: "lag-compare"};
			}
		} else if (isOperator(tmp)) {
			return {type: "operator", style: "lag-operator"};
		} else {
			return readWord();
		}
	}
	else
      return readWord();
  }

  // The external interface to the tokenizer.
  return function(source, startState) {
    return tokenizer(source, startState || lagTokenState(false, true));
  };
})();
