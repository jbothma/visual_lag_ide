/* Parse function for LAG. Makes use of the tokenizer from
 * tokenizelag.js. Note that your parsers do not have to be
 * this complicated -- if you don't want to recognize local variables,
 * in many languages it is enough to just look for braces, semicolons,
 * parentheses, etc, and know when you are inside a string or comment.
 *
 * See manual.html for more info about the parser interface.
 */

 
var LAGParser = Editor.Parser = (function () {    
    // Token types that can be considered to be atoms.
    var atomicTypes = {
        "atom": true,
        "number": true,
        "variable": true,
        "string": true,
        "regexp": true
    };

    // Constructor for the lexical context objects.
    function LAGLexical(indented, column, type, align, prev) {
        // indentation at start of this line
        this.indented = indented;
        // column at which this scope was opened
        this.column = column;
        // type of scope ('vardef', 'stat' (statement), 'form' (special form), '[', '{', or '(')
        this.type = type;
        // '[', '{', or '(' blocks that have any text after their opening
        // character are said to be 'aligned' -- any lines below are
        // indented all the way to the opening character.
        if (align != null) this.align = align;
        // Parent scope, if any.
        this.prev = prev;
    }
    
    // indentation rules.
    function indentLAG(lexical) {
        return function (firstChars) {
            var firstChar = firstChars && firstChars.charAt(0);
            var closing = firstChar == lexical.type;
            if (lexical.type == "vardef") return lexical.indented; // + 4;
            else if (lexical.type == "form" && firstChar == "(") return lexical.indented;
            else if (lexical.type == "stat" || lexical.type == "form") return lexical.indented; // + 2;
            else if (lexical.type == "init" || lexical.type == "impl") return lexical.indented;
            else if (lexical.align) return lexical.column - (closing ? 1 : 0);
            else return lexical.indented + (closing ? 0 : 2);
        };
    }

    // The parser-iterator-producing function itself.
    function parseLAG(input, basecolumn) {    
        // easy local reference
        var ToVisual = window.parent.LAGVE.ToVisual;
        
        // Wrap the input in a token stream
        var tokens = tokenizeLAG(input);
        
        // The parser state. cc is a stack of actions that have to be
        // performed to finish the current statement. For example we might
        // know that we still need to find a closing parenthesis and a
        // semicolon. Actions at the end of the stack go first. It is
        // initialized with an infinitely looping action that consumes
        // whole statements. NB - update, now it just looks for init and then impl
        var cc = [prog];
        
        // Context contains information about the current local scope, the
        // variables defined in that, and the scopes above it.
        var context = null;
        
        // The lexical scope, used mostly for indentation.
        var lexical = new LAGLexical((basecolumn || 0) - 2, 0, "block", false);
        
        // Current column, and the indentation at the start of the current
        // line. Used to create lexical scope objects.
        var column = 0;
        var indented = 0;
        // Variables which are used by the mark, cont, and pass functions
        // below to communicate with the driver loop in the 'next'
        // function.
        var consume, marked;

        // Saving variables
        //var currentVar = "";
        // The iterator object.
        var parser = {
            next: next,
            copy: copy
        };

        function next() {
            // Start by performing any 'lexical' actions (adjusting the
            // lexical variable), or the operations below will be working
            // with the wrong lexical state.
            // JB - in effect this loop just removes things off the stack which are: pushlex() and poplex()      
            while (cc.length && cc[cc.length - 1].lex) {
                cc.pop()();
            }

            // Fetch a token.
            var token = tokens.next();

            // Adjust column and indented.
            if (token.type == "whitespace" && column == 0) indented = token.value.length;
            column += token.value.length;
            if (token.content == "\n") {
                indented = column = 0;
                // If the lexical scope's align property is still undefined at
                // the end of the line, it is an un-aligned scope.
                if (!("align" in lexical)) lexical.align = false;
                // Newline tokens get an indentation function associated with
                // them.
                token.indentation = indentLAG(lexical);
            }
            // No more processing for meaningless tokens.
            if (token.type == "whitespace" || token.type == "comment") {
                return token;
            }
            // When a meaningful token is found and the lexical scope's
            // align is undefined, it is an aligned scope.
            if (!("align" in lexical)) lexical.align = true;

            // Execute actions until one 'consumes' the token and we can
            // return it. Marked is used to 
            while (true) {
                consume = marked = false;
                // Take and execute the topmost action.
                var action = cc.pop();
                action(token.type, token.content);
                if (consume) {
                    // Marked is used to change the style of the current token.
                    if (marked) {
                        token.style = marked;
                    } 
                    if (token.type === "EOF")
                        throw StopIteration;
                    else
                        return token;
                }
            }
        }

        // This makes a copy of the parser state. It stores all the
        // stateful variables in a closure, and returns a function that
        // will restore them when called with a new input stream. Note
        // that the cc array has to be copied, because it is contantly
        // being modified. Lexical objects are not mutated, and context
        // objects are not mutated in a harmful way, so they can be shared
        // between runs of the parser.
        function copy() {
            var _context = context,
                _lexical = lexical,
                _cc = cc.concat([]),
                _tokenState = tokens.state;

            return function (input) {
                context = _context;
                lexical = _lexical;
                cc = _cc.concat([]); // copies the array
                column = indented = 0;
                tokens = tokenizeLAG(input, _tokenState);
                return parser;
            };
        }

        // Helper function for pushing a number of actions onto the cc
        // stack in reverse order.
        function push(fs) {
            for (var i = fs.length - 1; i >= 0; i--) {
                cc.push(fs[i]);
            }
        }
        
        // cont and pass are used by the action functions to add other
        // actions to the stack. cont will cause the current token to be
        // consumed, pass will leave it for the next action.
        function cont() {
            push(arguments);
            consume = true;
        }

        function pass() {
            push(arguments);
            consume = false;
        }

        function error(f) {
            debugDisplay(f);
        }
        
        // Used to change the style of the current token.
        function mark(style) {
            marked = style;
        }
        
        // http://marijn.haverbeke.nl/codemirror/contrib/php/index.html
        // http://marijn.haverbeke.nl/codemirror/contrib/php/LICENSE
        // Add a lyer of style to the current token, for example syntax-error
        function markAdd(style){
            if (!marked) marked = style;
            else marked = marked + ' ' + style;
        }
        
        function markError() {
            markAdd("lag-syntax-error");
        }

        // Push a new lexical context of the given type.
        function pushlex(type) {
            var result = function () {
                lexical = new LAGLexical(indented, column, type, null, lexical)
            };
            result.lex = true;
            return result;
        }
        
        // Pop off the current lexical context.
        function poplex() {
            lexical = lexical.prev;
        }
        poplex.lex = true;
        // The 'lex' flag on these actions is used by the 'next' function
        // to know they can (and have to) be ran before moving on to the
        // next token.
        // Looks for an init, followed by an impl
        // Using pass() means that prog() doesn't consumed yet, but
        // passes the token onto init()
        
        /**
         *  argument: type e.g. "init"
         *  
         *  searches down lex scope stack until end (returning false)
         *  or lex scope of type type is found (returning true)
         */
        function withinLexType(type) {
            var lex = lexical;
            while (lex) {
                if (lex.type === type) {
                    return true;
                } else {
                    lex = lex.prev;
                }
            }
            return false;
        }

        /**
         *  Creates an action that will log to the FireBug console, if it exists
         */
        function logAction(logmsg) {
            return function() {
                if (typeof(console) !== 'undefined' && typeof(console.log) === 'function') {
                    console.log(logmsg);
                }
            }
        }
        function log(logmsg) {
            if (typeof(console) !== 'undefined' && typeof(console.log) === 'function') {
                console.log(logmsg);
            }
        }
        
        function prog(type) {
            //return pass(initImpl, statements);
            return pass(init, impl);
        }

        // If it is either "initialisation" or "implementation" then OK, otherwise turn it red...
        // Expect an (, then a multistatements (which returns: statement followed by multistatement OR carries the token onto the next
        // element in the stack...
        function init(type) {
            if (type == "init") {
                cont(pushlex("init"), ToVisual.action('start init'), expect("("), pushlex(")"), multistatements, poplex, expect(")"), ToVisual.action('finish init'), poplex);
            }
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>initialization</b>");
                cont(arguments.callee);
            }
        }

        function impl(type) {
            if (type == "impl") { 
                cont(pushlex("impl"), ToVisual.action('start impl'), expect("("), pushlex(")"), multistatements, poplex, expect(")"), ToVisual.action('finish impl'), poplex, expect("EOF"));
            }
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>implementation</b>");
                cont(arguments.callee);
            }
        }

        // If the token passed to multistatements is a ) then it is passed onto the next element,
        // otherwise, it is passed onto statement and multistatement is expected afterwards...
        function multistatements(type) {
            if (type == ")") {
                return pass(); // So that the ) isn't consumed, since multistatements is always followed by an expect(")")
                // Jon Bevan: Do we need to get rid of any remaining multistatements that are on the stack expecting atm...?
            } else {
                return pass(statement, multistatements);
            }
        }

        // Creates an action that discards tokens until it finds one of
        // the given type.
        function expect(wanted) {
            return function (type) {
                if (type == wanted) {
                    logAction('make and finish ' + type);
                    cont();
                } else {
                    markError();
                    error("Found: <b style=\"color: red;\">" + type + "</b>: Expected <b>" + wanted + "</b>");
                    cont(arguments.callee);
                }
            };
        }

        // Dispatches various types of statements based on the type of the
        // current token.
        function statement(type, tokenValue) {
            if (type == "if") cont(ToVisual.action('start if'), condition, pushlex("form"), then, /*poplex,*/ ToVisual.action('finish if'));
            else if (type == "while" && withinLexType("init")) cont(ToVisual.action('make while'), pushlex("form"), condition, expect("("), pushlex(")"), multistatements, expect(")"), poplex, poplex, ToVisual.action('finish while'));
            else if (type == "for") cont(ToVisual.action('make for'), pushlex("form"), range, dostat, poplex, ToVisual.action('finish for'));
            else if (type == "break") cont(pushlex("form"), sourcelabel, poplex);
            //else if (type == "stat") cont(pushlex("form"), expect("("), pushlex(")"), condition, expect(")"), poplex, poplex);
            // assignment
            else if (type == "model") pass(pushlex("form"), attribute(), operator, value, poplex);
            else if (type == ")") pass(); // end of init or impl?
            else {
                markError();
                error(
                    "Found <b style=\"color:red;\">" + 
                    type + 
                    "</b>: Expected <b>), if, " +
                    (withinLexType("init") ? "while, " : "") +
                    "for, break, generalise, specialise, GM, DM, PM, UM</b>");
                cont();
            }
        }

        // Need to allow for (condition)* -- DONE!
        function condition(type, tokenValue) {
            if (type == "model") pass( ToVisual.action('start condition'), pushlex("stat"), attribute(), comparator, value, poplex, ToVisual.action('finish condition') );
            else if (type == "enough") cont( ToVisual.action('start condition'), pushlex("stat"), expect("("), pushlex(")"), setOfCondition, value, expect(")"), poplex, poplex, ToVisual.action('finish condition') );
            else if (type == "boolean") cont( ToVisual.action('start condition'), ToVisual.action('boolean', tokenValue), ToVisual.action('finish condition') );
            else if (type == "(") cont( pushlex("stat"), condition, expect(")"), poplex ); // allows braces around conditions
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>GM, UM, PM, DM, Concept, enough, true, false</b>");
                cont();
            }
        }

       
        function then(type) {
            if (type == "then") cont( ToVisual.action('start then') , /*pushlex("form"), */expect("("), pushlex(")"), multistatements, expect(")"), poplex, poplex, ToVisual.action('finish then') , posselse);
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>then</b>");
                cont();
            }
        }

        function posselse(type) {
            if (type == "else") cont(ToVisual.action('start else') , pushlex("form"), expect("("), pushlex(")"), multistatements, expect(")"), poplex, poplex, ToVisual.action('finish else') );
            else pass(); // because it's optional, you need to NOT consume the token if it isnt an "else"
        }

        function dostat(type) {
            if (type == "do") cont(pushlex("form"), expect("("), pushlex(")"), multistatements, expect(")"), poplex, poplex);
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>do</b>");
                cont();
            }
        }

        function range(type) {
            if (type == "number") cont();
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>number</b>");
                cont();
            }
        }

        function sourcelabel(type) {
            if (type == "variable") cont();
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>variable</b>");
                cont();
            }
        }

        function model(type) {
            if (type == "model") cont();
            else if (type == "variable") cont();
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>DM, GM, UM, PM, Concept, variable</b>");
                cont();
            }
        }
        
        
        function attribute() {
            return function(type) {
                if (type == "model") cont(logAction('start attribute'), expect("."), dotsep(model), logAction('finish attribute'));
                else {
                    markError();
                    error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>DM, GM, UM, PM</b>");
                    cont();
                }
            }
        }
        

        // Look for conditions until a closing brace is found.
        function setOfCondition(type) {
            if (type == ",") {
                return cont();
            } else {
                return pass(condition, setOfCondition);
            }
        }

        // Parses a dot-separated list of the things that are recognized
        // by the 'what' argument.
        function dotsep(what) {
            function proceed(type) {
                if (type == ".") cont(what, proceed);
                //else if (type == "variable") cont();
            };
            return function () {
                pass(what, proceed);
            };
        }

        // If it is a comparator carry on, otherwise colour it red
        function comparator(type) {
            if (type == "comparator") cont();
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>&lt;, &gt;, ==, !=, in</b>");
                cont();
            }
        }

        function operator(type) {
            if (type == "operator") cont();
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>=, .=, +=, -=</b>");
                cont();
            }
        }
        
        // If it is text (variable) or numeric (number) then carry on, else mark it red
        function value(type) {
            if (type == "variable") cont();
            else if (type == "model") pass(attribute());
            else if (type == "number") cont();
            else if (type == "boolean") cont();
            else {
                markError();
                error("Found <b style=\"color:red;\">" + type + "</b>: Expected <b>variable, true, false, number, DM, UM, GM, PM, Concept</b>");
                cont();
            }
        }

        return parser;
    }

    return {
        make: parseLAG,
        electricChars: "()",
    };
})();