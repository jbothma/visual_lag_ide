/* CodeMirror main module
 *
 * Implements the CodeMirror constructor and prototype, which take care
 * of initializing the editor frame, and providing the outside interface.
 */

// The CodeMirrorConfig object is used to specify a default
// configuration. If you specify such an object before loading this
// file, the values you put into it will override the defaults given
// below. You can also assign to it after loading.
var CodeMirrorConfig = window.CodeMirrorConfig || {};

var CodeMirror = (function(){
  function setDefaults(object, defaults) {
    for (var option in defaults) {
      if (!object.hasOwnProperty(option))
        object[option] = defaults[option];
    }
  }
  function forEach(array, action) {
    for (var i = 0; i < array.length; i++)
      action(array[i]);
  }

  // These default options can be overridden by passing a set of
  // options to a specific CodeMirror constructor. See manual.html for
  // their meaning.
  setDefaults(CodeMirrorConfig, {
    stylesheet: "",
    path: "",
    parserfile: [],
    basefiles: ["util.js", "stringstream.js", "select.js", "undo.js", "editor.js", "tokenize.js", "pealfunctions.js", "pealconfig.js"],
    linesPerPass: 15,
    passDelay: 200,
    continuousScanning: false,
    saveFunction: null,
    onChange: null,
    undoDepth: 35,
    undoDelay: 800,
    disableSpellcheck: true,
    textWrapping: true,
    readOnly: false,
    width: "100%",
    height: "300px",
    autoMatchParens: false,
    parserConfig: null,
    dumbTabs: false,
	normalTab: false,
    activeTokens: null,
    cursorActivity: null,
	lineNumbers: true
  });

  function wrapLineNumberDiv(place) {
    return function(node) {
      var container = document.createElement("DIV"),
          nums = document.createElement("DIV");
      nums.className = "CodeMirror-line-numbers";
      container.style.position = "relative";
      nums.style.position = "absolute";
      nums.style.height = "100%";
      if (nums.style.setExpression)
        nums.style.setExpression("height", "this.previousSibling.offsetHeight + 'px'");
      nums.style.top = "0px";
      nums.style.overflow = "hidden";
      place(container);
	  
	  var fContainer = document.createElement("DIV"),
		frags = document.createElement("DIV"),
		fragViewer = document.createElement("DIV"),
		fragSelect = document.createElement("SELECT"),
		fragInsert = document.createElement("INPUT");
	  fContainer.className = "PEAL-fragments";
	  
	  frags.className = "PEAL-frags";
	  fragSelect.size = "10";
	  fragSelect.id = "fragmentList";
	  fragSelect.addEventListener('change', updatePreview, false);
	  var noFrags = document.createElement("OPTION");
	  noFrags.innerHTML = "Loading fragments...";
	  noFrags.value = "There are currently no code fragments available for insertion into the current strategy.";
	  fragSelect.appendChild(noFrags);
	  
	  fragInsert.type = "button";
	  fragInsert.value = "Insert Code";
	  fragInsert.addEventListener('click', openFragment, false);
	  
	  frags.appendChild(fragSelect);
	  frags.appendChild(document.createElement("BR"));
	  frags.appendChild(fragInsert);
	  
	  fragViewer.innerHTML = "&nbsp;";
	  fragViewer.id = "fragmentViewer";
	  fragViewer.style.fontSize = "smaller";
	  
	  
	  fContainer.appendChild(frags);
	  fContainer.appendChild(fragViewer);	  
	  container.appendChild(fContainer);
      container.appendChild(node);
      container.appendChild(nums);
    }
  }
  
  function nodeTop(node) {
    var accum = 0;
    while (node) {
      accum += node.offsetTop;
      node = node.offsetParent;
    }
    return accum;
  }

  function computedStyle(el) {
    return el.currentStyle || el.ownerDocument.defaultView.getComputedStyle(el, null);
  }

  var defaultWidth = "25px";

  function applyLineNumbers(frame) {
    var win = frame.contentWindow, doc = win.document,
        nums = frame.nextSibling, scroller = document.createElement("DIV"),
        test = doc.createElement("SPAN");

    var width = nums.offsetWidth + "px";
    if (nums.offsetWidth <= 10) nums.style.width = width = defaultWidth;
    frame.parentNode.style.marginLeft = width;
    nums.style.left = "-" + width;

    test.appendChild(doc.createTextNode("\u200b"));
    doc.body.insertBefore(test, doc.body.firstChild);
    setTimeout(function() {
      scroller.style.paddingTop = nodeTop(test) + "px";
      var computedHeight = computedStyle(test).lineHeight;
      scroller.style.lineHeight = /px$/.test(computedHeight) ? computedHeight : test.offsetHeight + "px";
      doc.body.removeChild(test);

      nums.appendChild(scroller);
      var nextNum = 1;
      function resize() {
        var diff = 20 + Math.max(doc.body.offsetHeight, frame.offsetHeight) - scroller.offsetHeight;
        for (var n = Math.ceil(diff / 10); n > 0; n--) {
          scroller.appendChild(document.createTextNode(String(nextNum++)));
          scroller.appendChild(document.createElement("BR"));
        }
      }
      resize();
      win.addEventHandler(doc, "resize", resize);
      win.addEventHandler(win, "scroll", function(){
        resize();
        nums.scrollTop = doc.body.scrollTop || doc.documentElement.scrollTop || 0;
      });
    }, 0);
  }
  
  function CodeMirror(place, options) {
    // Use passed options, if any, to override defaults.
    this.options = options = options || {};
    setDefaults(options, CodeMirrorConfig);

    var frame = this.frame = document.createElement("IFRAME");
    frame.src = "javascript:false;";
    frame.style.border = "0";
    frame.style.width = options.width;
    frame.style.height = options.height;
    // display: block occasionally suppresses some Firefox bugs, so we
    // always add it, redundant as it sounds.
    frame.style.display = "block";

    if (place.appendChild) {
      var node = place;
      place = function(n){node.appendChild(n);};
    }
    //if (options.lineNumbers) place = wrapLineNumberDiv(place);
	place = wrapLineNumberDiv(place);			// required now to display the code fragment part
    place(frame);

    // Link back to this object, so that the editor can fetch options
    // and add a reference to itself.
    frame.CodeMirror = this;
    this.win = frame.contentWindow;

    if (typeof options.parserfile == "string")
      options.parserfile = [options.parserfile];
    if (typeof options.stylesheet == "string")
      options.stylesheet = [options.stylesheet];

    var html = ["<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\"><html><head>"];
    forEach(options.stylesheet, function(file) {
      html.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + file + "\"/>");
    });
    forEach(options.basefiles.concat(options.parserfile), function(file) {
      html.push("<script type=\"text/javascript\" src=\"" + options.path + file + "\"></script>");
    });
    html.push("</head><body style=\"border-width: 0;\" class=\"editbox\" spellcheck=\"" +
              (options.disableSpellcheck ? "false" : "true") + "\"></body></html>");

    var doc = this.win.document;
    doc.open();
    doc.write(html.join(""));
    doc.close();
  }

  CodeMirror.prototype = {
    init: function() {
      if (this.options.initCallback) this.options.initCallback(this);
      //if (this.options.lineNumbers) applyLineNumbers(this.frame);
	  applyLineNumbers(this.frame);			//necessary now due to fragment viewer
    },

    getCode: function() {return this.editor.getCode();},
    setCode: function(code) {this.editor.importCode(code);},
    selection: function() {return this.editor.selectedText();},
    reindent: function() {this.editor.reindent();},

    focus: function() {
      this.win.focus();
      if (this.editor.selectionSnapshot) // IE hack
        this.win.select.selectCoords(this.win, this.editor.selectionSnapshot);
    },
    replaceSelection: function(text) {
      this.focus();
      this.editor.replaceSelection(text);
      return true;
    },
    replaceChars: function(text, start, end) {
      this.editor.replaceChars(text, start, end);
    },
    getSearchCursor: function(string, fromCursor) {
      return this.editor.getSearchCursor(string, fromCursor);
    },

    undo: function() {this.editor.history.undo();},
    redo: function() {this.editor.history.redo();},
    historySize: function() {return this.editor.history.historySize();},
	
    cursorPosition: function(start) {
      if (this.win.select.ie_selection) this.focus();
      return this.editor.cursorPosition(start);
    },
    firstLine: function() {return this.editor.firstLine();},
    lastLine: function() {return this.editor.lastLine();},
    nextLine: function(line) {return this.editor.nextLine(line);},
    prevLine: function(line) {return this.editor.prevLine(line);},
    lineContent: function(line) {return this.editor.lineContent(line);},
    setLineContent: function(line, content) {this.editor.setLineContent(line, content);},
    insertIntoLine: function(line, position, content) {this.editor.insertIntoLine(line, position, content);},
    selectLines: function(startLine, startOffset, endLine, endOffset) {
      this.win.focus();
      this.editor.selectLines(startLine, startOffset, endLine, endOffset);
    },
    nthLine: function(n) {
      var line = this.firstLine();
      for (; n > 1 && line !== false; n--)
        line = this.nextLine(line);
      return line;
    },
    lineNumber: function(line) {
      var num = 0;
      while (line !== false) {
        num++;
        line = this.prevLine(line);
      }
      return num;
    },

    // Old number-based line interface
    jumpToLine: function(n) {
      this.selectLines(this.nthLine(n), 0);
      this.win.focus();
    },
    currentLine: function() {
      return this.lineNumber(this.cursorPosition().line);
    }
  };

  CodeMirror.InvalidLineHandle = {toString: function(){return "CodeMirror.InvalidLineHandle";}};

  CodeMirror.replace = function(element) {
    if (typeof element == "string")
      element = document.getElementById(element);
    return function(newElement) {
      element.parentNode.replaceChild(newElement, element);
    };
  };

  CodeMirror.fromTextArea = function(area, options) {
    if (typeof area == "string")
      area = document.getElementById(area);

    options = options || {};
    if (area.style.width) options.width = area.style.width;
    if (area.style.height) options.height = area.style.height;
    if (options.content == null) options.content = area.value;

    if (area.form) {
      function updateField() {
        area.value = mirror.getCode();
      }
      if (typeof area.form.addEventListener == "function")
        area.form.addEventListener("submit", updateField, false);
      else
        area.form.attachEvent("onsubmit", updateField);
    }

    function insert(frame) {
      if (area.nextSibling)
        area.parentNode.insertBefore(frame, area.nextSibling);
      else
        area.parentNode.appendChild(frame);
    }

    area.style.display = "none";
    var mirror = new CodeMirror(insert, options);
    return mirror;
  };

  CodeMirror.isProbablySupported = function() {
    // This is rather awful, but can be useful.
    var match;
    if (window.opera)
      return Number(window.opera.version()) >= 9.52;
    else if (/Apple Computers, Inc/.test(navigator.vendor) && (match = navigator.userAgent.match(/Version\/(\d+(?:\.\d+)?)\./)))
      return Number(match[1]) >= 3;
    else if (document.selection && window.ActiveXObject && (match = navigator.userAgent.match(/MSIE (\d+(?:\.\d*)?)\b/)))
      return Number(match[1]) >= 6;
    else if (match = navigator.userAgent.match(/gecko\/(\d{8})/i))
      return Number(match[1]) >= 20050901;
    else if (/Chrome\//.test(navigator.userAgent))
      return true;
    else
      return null;
  };

  return CodeMirror;
})();
