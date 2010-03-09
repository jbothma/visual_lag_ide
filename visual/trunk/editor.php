<?php
    include_once("php/peal_config.php");
    include_once("php/session_functions.php");
    if (!checkSession()) {
        header ("Location: index.php?wrongdetails");
    } else {
        header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        header("Cache-Control: no-cache");
        header("Pragma: no-cache");
        header("Content-Type: text/html;charset=utf-8");
    }
?>
<?php echo("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"); //Because PHP short open tag parses like xml declaration. ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
          "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

        <title><?php echo $peal_version_string;?></title>
        
        <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/combo?3.0.0/build/widget/assets/skins/sam/widget.css&3.0.0/build/console/assets/skins/sam/console.css&3.0.0/build/node-menunav/assets/skins/sam/node-menunav.css">
        <link rel="stylesheet" type="text/css" href="css/docs.css"/>
        <link rel="stylesheet" type="text/css" href="css/peal.css"/>
        <link rel="stylesheet" type="text/css" href="css/visual_editor.css"/>

    </head>
    <body class="yui-skin-sam">
        <div id="VE-loading-msg-centering">
            <div id="VE-loading-msg">
                <script type="text/javascript">
                //<![CDATA[
                    // By writing the loading message using JavaScript, the loading message 
                    // is only displayed if we actually have JS enabled to load the JS libraries.
                    document.getElementById('VE-loading-msg').
                        appendChild(document.createTextNode('Please wait while PEAL loads...'));
                //]]>
                </script>
                <noscript>This site relies heavily on javascript which must be enabled in your web browser.</noscript>
            </div>
        </div>
        <!--
            Start with #playground hidden. This means only the 'loading...' message is shown while 
            the javascript setup stuff runs. Javascript finally hides the loding message and shows #playground.
            Don't hide with display:none becasue CodeMirror requires computed styles.
        -->
        <div id="playground" style="visibility:hidden">
            <div id="header">
                <div class="logout">
                    <a href="php/logout.php">Logout</a>
                </div>
                <div id="title">
                    <p><?php echo $peal_version_string;?></p>
                </div>
            </div>
            <form id="savedetails" name="savedetails" action="">
                <img src="png/page_white.png" 
                    onclick="newStrategy();" 
                    title="New Strategy" 
                    alt="New Strategy" 
                />
                <img src="png/page_white_star.png" 
                    onclick="showWizard();" 
                    title="Show Wizard" 
                    alt="Show Wizard" 
                />
                |
                <img src="png/folder_page.png" 
                    onclick="showFileManager();" 
                    title="Open" 
                    alt="Open" 
                />
                <!-- Strategy name: --> <input id="stratname" name="stratname" type="hidden" size="30" />
                <img src="png/disk.png" 
                    title="Save" 
                    alt="Save" 
                    onclick="saveStrategy();" 
                />
                <img src="png/disk_multiple.png" 
                    title="Save As" 
                    alt="Save As" 
                    onclick="saveStrategy('copy');" 
                />
                <img src="png/page_text_save.png" 
                    title="Save Code Fragment" 
                    alt="Save Code Fragment" 
                    onclick="saveFragment();" 
                />
                |
                <img src="png/page_white_put.png" 
                    title="Download" 
                    alt="Download" 
                    onclick="downloadStrategy();"
                />
                |
                <span id="pubpriv" style="font-size: 10pt; padding-right:3px;">Private</span>
                <img id="lockimg" 
                    src="png/lock.png" 
                    title="Make Strategy Public" 
                    alt="Make strategy public:" 
                    onclick="publicCheckBox(false);"
                />
                <input id="chkpublic" 
                    name="chkpublic" 
                    type="hidden" 
                    onclick="publicCheckBox(true);"
                />
                |
                <img src="png/arrow_undo.png" 
                    title="Undo" 
                    alt="Undo" 
                    onclick="editor.mirror.editor.history.undo();" 
                />
                <img src="png/arrow_redo.png" 
                    title="Redo" 
                    alt="Redo" 
                    onclick="editor.mirror.editor.history.redo();" 
                />
                |
                <span id="isSaved" style="font-size: 10pt;"></span>
            </form>
            <div id="VE-menu-container">
                <div id="VE-menu" class="yui-menu yui-menu-horizontal" style="display:none">
                    <div class="yui-menu-content">
                        <ul class="first-of-type"> 
                            <li class="yui-menuitem">
                                <a id="LAG-Attr-menulabel" class="yui-menu-label" href="#LAG-Attr-Menu" title="Insert a LAG Attribute or value">                                    
                                    Attribute
                                </a>
                                <div id="LAG-Attr-Menu" class="yui-menu">
                                    <div class="yui-menu-content">
                                        <ul> 
                                            <li>
                                                <a class="yui-menu-label" href="#GM" title="Goal Model"><em>GM</em></a>
                                                <div id="GM" class="yui-menu">
                                                    <div class="yui-menu-content">
                                                        <ul> 
                                                            <li>
                                                                <a class="yui-menu-label" href="#GM-Concept"><em>Concept</em></a>
                                                                <div id="GM-Concept" class="yui-menu">
                                                                    <div class="yui-menu-content">
                                                                        <ul> 
                                                                            <li class="yui-menuitem">
                                                                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.insertNewAttr(['GM','Concept','label'])">label</a>
                                                                            </li>
                                                                            <li class="yui-menuitem"><!-- Bounding box -->
                                                                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.insertNewAttr(['GM','Concept','weight'])">weight</a>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div> <!-- end GM.Concept -->
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div> <!-- end GM -->
                                            </li>

                                            <li>
                                                <a class="yui-menu-label" href="#PM" title="Presentation Model"><em>PM</em></a>
                                                <div id="PM" class="yui-menu">
                                                    <div class="yui-menu-content">
                                                        <ul> 
                                                            <li>
                                                                <a class="yui-menu-label" href="#PM-GM" title="Goal Model"><em>GM</em></a>
                                                                <div id="PM-GM" class="yui-menu">
                                                                    <div class="yui-menu-content">
                                                                        <ul> 
                                                                            <li>
                                                                                <a class="yui-menu-label" href="#PM-GM-Concept"><em>Concept</em></a>
                                                                                <div id="PM-GM-Concept" class="yui-menu">
                                                                                    <div class="yui-menu-content">
                                                                                        <ul>
                                                                                            <li class="yui-menuitem">
                                                                                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.insertNewAttr(['PM','GM','Concept','access'])">access</a>
                                                                                            </li>
                                                                                            <li class="yui-menuitem">
                                                                                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.insertNewAttr(['PM','GM','Concept','show'])">show</a>
                                                                                            </li>
                                                                                            <li class="yui-menuitem">
                                                                                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.insertNewAttr(['PM','GM','Concept','type'])">type</a>
                                                                                            </li>
                                                                                            <li class="yui-menuitem">
                                                                                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.insertNewAttr(['PM','GM','Concept','visible'])">visible</a>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </div> <!-- end PM.GM.Concept -->
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div> <!-- end PM.GM -->
                                                            </li>
                                                            <li>
                                                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.insertNewAttr(['PM','menu'])">menu</a>
                                                            </li>
                                                            <li>
                                                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.insertNewAttr(['PM','next'])">next</a>
                                                            </li>
                                                            <li>
                                                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.insertNewAttr(['PM','ToDo'])">ToDo</a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div> <!-- end PM -->
                                            </li>

                                            <li>
                                                <a class="yui-menu-label" href="#UM" title="User Model"><em>UM</em></a>
                                                <div id="UM" class="yui-menu">
                                                    <div class="yui-menu-content">
                                                        <ul> 
                                                            <li>
                                                                <a class="yui-menu-label" href="#UM-Concept"><em>Concept</em></a>
                                                                <div id="UM-Concept" class="yui-menu">
                                                                    <div class="yui-menu-content">
                                                                        <ul> 
                                                                            <li class="yui-menuitem">
                                                                                <form action="#" class="yui-menuitem-content" onsubmit="LAGVE.insertNewAttr(['UM','Concept',document.getElementById('UM-Concept-custom').value]);return false" title="Replace the text with out custom value and press Enter to finish">
                                                                                    <div><input id="UM-Concept-custom" class="menu-form-input" value="custom" type="text" /></div>
                                                                                </form>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div> <!-- end UM.Concept -->
                                                            </li>
                                                            <li class="yui-menuitem">
                                                                <form action="#" class="yui-menuitem-content" onsubmit="LAGVE.insertNewAttr(['UM',document.getElementById('UM-custom').value]);return false" title="Replace the text with out custom value and press Enter to finish">
                                                                    <div><input id="UM-custom" class="menu-form-input" value="custom" type="text" /></div>
                                                                </form>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div> <!-- end UM -->
                                            </li>
                                            <li>
                                                <a class="yui-menuitem-content" href="#" onclick="LAGVEAttr.newBoolean('true')">true</a>
                                            </li>
                                            <li>
                                                <a class="yui-menuitem-content" href="#" onclick="LAGVEAttr.newBoolean('false')">false</a>
                                            </li>
                                            <li class="yui-menuitem">
                                                <form action="#" class="yui-menuitem-content" onsubmit="LAGVE.insertNewAttr([document.getElementById('custom').value]);return false"    title="Replace the text with out custom value and press Enter to finish">
                                                    <div><input id="custom" class="menu-form-input" value="value" type="text" /></div>
                                                </form>
                                            </li>
                                        </ul> 
                                    </div> 
                                </div> <!-- end LAG-attr-menu -->
                            </li>
                            <li class="yui-menuitem">
                                <a class="yui-menuitem-content" href="#" onclick="LAGVEActn.newAction(LAGVE.selectedNode)">Action</a>
                            </li>
                            <li class="yui-menuitem">
                                <a class="yui-menuitem-content" href="#" onclick="LAGVECondition.newComparison(LAGVE.selectedNode)">Comparison</a>
                            </li>
                            <li class="yui-menuitem">
                                <a class="yui-menuitem-content" href="#" onclick="LAGVECondition.newXjunction({targetNode:LAGVE.selectedNode,type:'conjunction'})">Conjunction</a>
                            </li>
                            <li class="yui-menuitem">
                                <a class="yui-menuitem-content" href="#" onclick="LAGVECondition.newXjunction({targetNode:LAGVE.selectedNode,type:'disjunction'})">Disjunction</a>
                            </li>
                            <li class="yui-menuitem">
                                <a class="yui-menuitem-content" href="#" onclick="LAGVECondition.newXjunction({targetNode:LAGVE.selectedNode,type:'enough'})">Enough</a>
                            </li>
                            <li class="yui-menuitem">
                                <a class="yui-menuitem-content" href="#" onclick="LAGVEIf.newIf(LAGVE.selectedNode)">IfThenElse</a>
                            </li>
                            <li class="yui-menuitem">
                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.showHelp()">Help</a>
                            </li>
                            <li class="yui-menuitem">
                                <a class="yui-menuitem-content" href="#" onclick="LAGVE.ToVisual.convert()">To Visual</a>
                            </li>
                        </ul>
                    </div>
                </div> <!-- end VE-menu -->
            </div> <!-- end VE-menu-container -->
            <div class="tabview" id="peal">
                <ul class="tabview-tabs"> 
                    <li id="strategy-description-tab" class="strategy-description-indicator" ><a href="#strategy-description">Description</a></li>
                    <li class="visualeditor-tab"><a href="#init-editor">Initialization</a></li> 
                    <li class="visualeditor-tab"><a href="#impl-editor">Implementation</a></li> 
                    <li id="texteditor-tab"><a href="#texteditor">Text Editor</a></li>
                </ul>
                <div class="tabview-content"> 
                    <div id="strategy-description" class="tabview-hidden strategy-description-indicator">
                        <p>Description of strategy for the lay person</p>
                        <textarea id="strategy-description-editor" rows="10" cols="80"></textarea>
                    </div>
                    <div id="init-editor" class="visualeditor tabview-hidden">
                        <div class="initialization VE-workspace select-propagation-stop"></div>
                    </div>
                    <div id="impl-editor" class="visualeditor tabview-hidden"> 
                        <div class="implementation VE-workspace select-propagation-stop"></div>
                    </div>
                    <div id="texteditor">
                        <!-- CodeMirror will be given #code. CodeMirror will turn #code into an iframe and make it an interactive LAG editor. -->
                        <textarea id="code" cols="120" rows="40"></textarea>
                        
                        <!-- #cc is going to sit below the LAG editor window, displaying parser messages -->
                        <div id="cc" style="font-size: 10pt; border-top: 1px solid black;">&nbsp;</div> 
                        <!-- #autocomplete is hidden until text is typed which prompts autocomplete to be displayed with suggestions. -->
                        <div id="autocomplete">
                            <select id="autowords" 
                                size="4" 
                                onclick="
                                    insertAutoComplete(); 
                                    document.getElementById('autocomplete').style.left = -1000 + 'px'; 
                                    document.getElementById('autocomplete').style.top = 0 + 'px';
                                "
                            >
                                <!--
                                    <select> requires at least one <option> or <optgroup>
                                    but this <select> is populated dynamically.
                                    Instead of placing an empty <option> here, editor.js 
                                    deals with UP and DOWN key presses regarding autocomplete 
                                -->
                                <option></option><!-- But I'm putting one in anyway to make it validate for the moment. -->
                            </select>
                        </div>
                    </div> <!-- end texteditor -->
                </div> <!-- tabview-content -->
            </div>
            <div id="wizard" class="dragable">
                <div id="wizardtitle" class="handle">New Strategy Creation Wizard</div>
                <div id="closebutton" onclick="cancelWizard();">&nbsp;</div>
                <div style="padding: 3pt;">
                    <form id="frmwizard" name="frmwizard" action="#">
                        Description:<br/>
                        <textarea id="description" cols="47" rows="5">
                        </textarea><br/><br/>
                        
                        New Variable Name:<br/>
                        <select id="var1" name="var1" onchange="newMenu(1);">
                            <option></option>
                        </select>
                        <select id="var2" name="var2" onchange="newMenu(2);">
                            <option></option>
                        </select>
                        <select id="var3" name="var3" onchange="newMenu(3);">
                            <option></option>
                        </select>
                        <select id="var4" name="var4">
                            <option></option>
                        </select>
                        <input type="text" size="15" id="var5" name="var5" /><br/>
                        
                        Initial Value/Expression:<br/>
                        <input type="text" size="61" id="init" />
                        <div style="text-align: right; width: 300pt;">
                            <input type="button" name="add" value="+ Add Variable" onclick="addVariableToList();" />
                        </div>
                        <select multiple="multiple" size="5" id="varcode" name="varcode" style="width: 100%;">
                            <option></option>
                        </select>
                        <div style="text-align: right; width: 300pt;">
                            <input type="button" name="remove" value="- Remove Variable" onclick="removeVariableFromList();" />
                        </div>
                        <div style="text-align: right; width: 300pt; padding-top: 5pt;">
                            <input type="button" value="OK" name="ok" onclick="okWizard();"/> 
                            <input type="button" value="Cancel" name="cancel" onclick="cancelWizard();"/>
                        </div>
                    </form>
                </div>
            </div>
            
            <div id="filemanager" class="dragable">
                <div id="filestitle" class="handle">File Manager</div>
                <div id="fileclosebutton" onclick="cancelFileManager();">&nbsp;</div>
                <div style="padding: 3pt;">
                    <form id="frmfiles" name="frmfiles" action="#">
                        <div style="float: right; width: 49%;">
                            Private:<br/>
                            <select size="10" id="privatefiles" name="privatefiles" style="width: 100%" onchange="selectedStrategy('false');">
                                <option></option>
                            </select>
                        </div>
                        <div style="width: 49%;">
                            Public:<br/>
                            <select size="10" id="publicfiles" name="publicfiles" style="width: 100%" onchange="selectedStrategy('true');">
                                <option></option>
                            </select>
                        </div>
                        
                        <!-- these two hidden inputs store a public/private flag and the filename for opening/deleting files -->
                        <input type="hidden" id="pstrat" name="pstrat" />
                        <input type="hidden" id="sname" name="sname" />
                        
                        <!-- public strategies should only be deletable by the original owner -->
                        <div style="text-align: right; width: 300pt;">
                            <input type="button" value="Open Strategy" name="open" onclick="openStrategy();"/> 
                            <input type="button" name="delete" value="Delete Strategy" onclick="deleteStrategy();" />
                        </div>
                        <div style="text-align: right; width: 300pt; padding-top: 5pt;">
                            <input type="button" value="Cancel" name="cancel" onclick="cancelFileManager();"/>
                        </div>
                    </form>
                </div>
            </div>
            <div id="licences" style="">
                <br/>
                PEAL is licensed by <a href="http://ww.ukarumpa.co.uk">Jon Bevan</a> 
                under a <a href="http://creativecommons.org/licenses/by/2.5/">Creative Commons Attribution 2.5 License</a>.<br/>

                The icons are licensed by <a href="http://www.famfamfam.com/lab/icons/silk/">Mark James</a> 
                under a <a href="http://creativecommons.org/licenses/by/2.5/">Creative Commons Attribution 2.5 License</a>.<br/>

                CodeMirror is licensed by <a href="http://marijn.haverbeke.nl/codemirror/">Marijn Haverbeke</a> 
                under a <a href="http://marijn.haverbeke.nl/codemirror/LICENSE">BSD-style license</a>.<br/>

                The Yahoo User Interface Library is licensed by <a href="http://developer.yahoo.com/yui/">Yahoo! Inc.</a> 
                and its components are provided free of charge under a <a href="http://developer.yahoo.com/yui/license.html">liberal BSD license</a>.
            </div>
        </div>
       
        <div id="VE-help">
            <div id="VE-help-titlebar">
                Visual LAG Editor Help (<a href="help.htm" onclick="LAGVE.hideHelp()">Page link</a>)
            </div>
            <div id="VE-help-closeBtn" onclick="LAGVE.hideHelp()">X</div>
            <div id="VE-help-container"></div>
        </div>
        
        <!-- CodeMirror -->
        <script src="js/codemirror.js"  type="text/javascript"></script>
        <script src="js/mirrorframe.js" type="text/javascript"></script>
        
        <!-- YUI -->
        <!-- YUI base can be used with the loader (YUI.get()) to get any needed modules dynamically -->
        <!--<script src="http://yui.yahooapis.com/3.0.0/build/yui/yui-min.js" type="text/javascript"></script>-->
        <script src="/lib/yui/yui/yui-min.js" type="text/javascript"></script>
        <!-- a single minimised combination of all the yui javascript library modules used is the quickest way to load them locally -->
        <!--<script src="js/yuistatic.js" type="text/javascript"></script>-->
        
        <!-- PEAL -->
        <script src="js/pealfunctions.js"   type="text/javascript"></script>
        <script src="js/pealconfig.js"      type="text/javascript"></script>
        <script src="js/pealajax.js"        type="text/javascript"></script>
        <script src="js/visual_editor.js"   type="text/javascript"></script>
        
        <script type="text/javascript">
        //<![CDATA[
            // CDATA line is commented because IE can only use xhmtl pages by acting like it's HTML.
            
            var textarea = document.getElementById('code');

            var editor = new MirrorFrame(CodeMirror.replace(textarea), {
                height: "200px",
                width: "85%",
                content: textarea.value,
                parserfile: ["tokenizelag.js", "parselag.js"],
                stylesheet: "css/lagcolors.css",
                path: "js/",
                lineNumbers: true,
                autoMatchParens: true,
                saveFunction: saveStrategy
            });
          
            var Y = new YUI({combine: true}).use('dd-drag','node', 'node-event-simulate', 'event', function(Y) {
                
                Y.on('contentready', function(){
                    
                    // Make the wizard dragable.
                    var d1 = new Y.DD.Drag({
                        node:       '#wizard',
                        useShim:    false,      // I think, with shim off, it has less issues dragging over the CodeMirror iframe
                    });
                    // Make wizardtitle a drag handle for wizard
                    d1.addHandle('#wizardtitle');
                    
                    // Make the wizard dragable.
                    var d2 = new Y.DD.Drag({
                        node:       '#filemanager',
                        useShim:    false,      // I think, with shim off, it has less issues dragging over the CodeMirror iframe
                    });
                    // Make filestitle a drag handle for filemanager
                    d2.addHandle('#filestitle');
                    
                    
                    /*
                        Set up editor tabs
                        http://925html.com/code/simple-tab-view-with-yui-3/
                        Published on January 3, 2010
                        Eric Ferraiuolo
                        Accessed 16 Feb 2010
                    */
                    Y.all('.tabview').each(function(){ 
                        this.delegate('click', toggleTabs, '.tabview-tabs a'); 
                    }); 
                 
                    /**
                     * Handle tab change
                     */
                    function toggleTabs (e) {
                        var tabview     = e.container, 
                            tabs        = tabview.all('.tabview-tabs li'), 
                            contents    = tabview.all('.tabview-content > *'), 
                            tab         = e.currentTarget.get('parentNode');
                            tabContents = Y.one(e.currentTarget.get('hash'));
                 
                        // hide all tab contents
                        contents.addClass('tabview-hidden');
                        // make all tabs inactive
                        tabs.removeClass('tabview-active');
                        // make selected tab active
                        tab.addClass('tabview-active')
                        // unhide active tab's contents
                        tabContents.removeClass('tabview-hidden');
                        
                        // We can check and colour description
                        // each time we change tabs
                        evaluateDescription();
                    }
                    
                    Y.on("domready", function() {
                        // select text editor tab by default.
                        var textTab = Y.one('#texteditor-tab');
                        textTab.simulate('click');
                    });
                    
                    
                    Y.one('#texteditor-tab').on('click', function() {
                        hideVEMenu();
                        if (LAGVE.initialization && LAGVE.implementation) {
                            var LAG = getDescriptionFromTab() + LAGVE.initialization.toLAG() + LAGVE.implementation.toLAG();
                            
                            //editor.mirror.setCode(LAG);
                            var message = 'Inserting the visual program into the text editor sometimes fails but it will basically look like this:\r\n\r\n';
                            var tryanyway = '\r\n\r\nTry anyway?';
                            
                            editor.mirror.setCode(LAG);
                        }
                    });
                    
                    Y.all('.visualeditor-tab').on('click', function() {
                        showVEMenu();
                    });
                    
                    Y.one('#strategy-description-tab').on('click', function() {
                        hideVEMenu();
                    });
                    
                    function hideVEMenu() {
                        if (LAGVE.mainMenu) LAGVE.mainMenu.setStyle('display','none');
                    }
                    
                    function showVEMenu() {
                        if (LAGVE.mainMenu) LAGVE.mainMenu.setStyle('display','');
                    }
                    
                    function getDescriptionFromTab() {
                        var descriptionNode = Y.one('#strategy-description-editor')
                        var description = 'DESCRIPTION\n\n' + descriptionNode.get('value');
                        description = description.replace( /^/gm, '// ' ) + '\n\n';
                        return description;
                    }
                    
                    function evaluateDescription() {
                        var description = Y.one('#strategy-description-editor').get('value');
                        
                        // http://stackoverflow.com/questions/1072765/count-number-of-matches-of-a-regex-in-javascript
                        var matches = description.match(/\w+/gm);
                        var wordCount = matches ? matches.length : 0;
                        
                        if ( wordCount > 20 ) {
                            Y.all('.strategy-description-indicator').addClass('strategy-description-ok');
                        } else {
                            Y.all('.strategy-description-indicator').removeClass('strategy-description-ok');
                        }
                    }
                }, 'body');
            });
            
            // The createMenus() call is for the Wizard
            createMenus();
            // Get the list of fragments available...
            getFragments();
        
        //]]>
        </script>
    </body>
</html>
