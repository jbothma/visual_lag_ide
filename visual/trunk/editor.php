<?php
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    header("Cache-Control: no-cache");
    header("Pragma: no-cache");

    include_once("php/session_functions.php");
    if (!checkSession()) {
        header ("Location: index.php?wrongdetails");
    }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

        <title>PEAL - version 0.5.5</title>
        <link rel="stylesheet" type="text/css" href="css/docs.css"/>
        <link rel="stylesheet" type="text/css" href="css/peal.css"/>
        

    </head>
    <body>
        <div class="playground" style="padding-left: 10pt; padding-top: 10pt;">
            <div style="border-bottom: 0px solid black;">
                <div style="float: right; padding-right: 5pt;">
                    <a href="php/logout.php">Logout</a>
                </div>
                <div style="margin-top: -15pt;">
                    <p>PEAL v0.5.5</p>
                </div>
            </div>
            <form id="savedetails" name="savedetails" style="font-size: 10pt;" action="">
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
        
            <div class="border tabview" id="peal">
                <ul class="tabview-tabs"> 
                    <li><a id="visualeditor-tab" href="#visualeditor">Visual Editor</a></li> 
                    <li><a id="texteditor-tab" href="#texteditor">Text Editor</a></li>
                </ul> 
                <div class="tabview-content"> 
                    <div id="visualeditor">
                    </div>
                    <div id="texteditor">
                        <!-- CodeMirror will be given #code. CodeMirror will turn #code into an iframe and make it an interactive LAG editor. -->
                        <textarea id="code" cols="120" rows="40">
                        </textarea>
                        
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
                                    Instead of placing an empty <option> here, editor.js 
                                    deals with UP and DOWN key presses regarding autocomplete 
                                -->
                            </select>
                        </div>
                    </div> <!-- end texteditor -->
                </div> <!-- tabview-content -->
            </div>
            
            <div id="wizard" class="dragable">
                <div id="wizardtitle" class="handle">New Strategy Creation Wizard</div>
                <div id="closebutton" onclick="cancelWizard();">&nbsp;</div>
                <div style="padding: 3pt;">
                    <form id="frmwizard" name="frmwizard" action="">
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
                            <input type="button" value="Cancel" name="cancel" onClick="cancelWizard();"/>
                        </div>
                    </form>
                </div>
            </div>
            
            <div id="filemanager" class="dragable">
                <div id="filestitle" class="handle">File Manager</div>
                <div id="fileclosebutton" onclick="cancelFileManager();">&nbsp;</div>
                <div style="padding: 3pt;">
                    <form id="frmfiles" name="frmfiles">
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
            <div style="font-size: 8pt;">
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
       
        <!-- CodeMirror -->
        <script src="js/codemirror.js" type="text/javascript"></script>
        <script src="js/mirrorframe.js" type="text/javascript"></script>
        
        <!-- YUI -->
        <script src="http://yui.yahooapis.com/3.0.0/build/yui/yui-min.js"></script>
        
        <!-- PEAL -->
        <script src="js/pealfunctions.js" type="text/javascript"></script>
        <script src="js/pealconfig.js" type="text/javascript"></script>
        <script src="js/pealajax.js" type="text/javascript"></script>
        
        <script type="text/javascript">
            var textarea = document.getElementById('code');

            // Hack in the default blank strategy
            textarea.innerHTML = '\
// DESCRIPTION\r\n\
//\r\n\
//\r\n\
\r\n\
// VARS\r\n\
//\r\n\
//\r\n\
\r\n\
initialization (\r\n\
\r\n\
)\r\n\
\r\n\
implementation (\r\n\
\r\n\
)\r\n\
            ';
            
            var editor = new MirrorFrame(CodeMirror.replace(textarea), {
                height: "350px",
                width: "85%",
                content: textarea.value,
                parserfile: ["tokenizelag.js", "parselag.js"],
                stylesheet: "css/lagcolors.css",
                path: "js/",
                lineNumbers: true,
                autoMatchParens: true,
                saveFunction: saveStrategy
            });
          
            var Y = new YUI().use('dd-drag','node', 'node-event-simulate', function(Y) {
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
                    Accessed 16/02/2010
                */
                Y.all('.tabview').each(function(){ 
                    this.delegate('click', toggleTabs, '.tabview-tabs a'); 
                }); 
             
                function toggleTabs (e) {              
                    var tabview = e.container, 
                        tabs = tabview.all('.tabview-tabs li'), 
                        contents = tabview.all('.tabview-content > *'), 
                        tab = e.currentTarget.get('parentNode'); 
             
                    contents.addClass('tabview-hidden') 
                        .item(tabs.removeClass('tabview-active').indexOf(tab.addClass('tabview-active'))) 
                            .removeClass('tabview-hidden'); 
             
                    e.preventDefault(); 
                }
                
                Y.on("domready", function() {
                    // select text editor tab by default.
                    var textTab = Y.one('#texteditor-tab');
                    textTab.simulate('click');
                });                
            });
        
            // The createMenus() call is for the Wizard
            createMenus();
            // Get the list of fragments available...
            getFragments();
            
        </script>
    </body>
</html>
