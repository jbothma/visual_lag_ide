LAGVE = new Object();
LAGVE.Elements = new Object();


YUI().use(
    'base',
    'dd-drag-plugin',
    function(Y) {
        /**
        * Augments elements to give ContextMenu for the element a Delete entry
        *
        * @class ContextDeletable
        * @namespace LAGVE.Elements
        * @constructor
        * @extends base
        */
        LAGVE.Elements.ContextDeletable function() {
            this._initResizable();
        }
         
        LAGVE.Elements.ContextDeletable = {
            contextMenu : {
                value:  true
            },
        };
         
        LAGVE.Elements.ContextDeletable.prototype = {
            _initContextDeletable : function() {}
        };
        
        
        /**
        * Base class for visual elements representing values in LAG code.
        * - Can be dragged into ValueContainer
        * - is ContextDeletable
        * 
        * @class Value
        * @namespace LAGVE.Elements
        * @requires base
        * @constructor
        * @extends base
        */
        LAGVE.Elements.Value = function(cfg) {
            Spinner.superclass.constructor.apply(this, arguments);
        }

        // Required class name
        LAGVE.Elements.Value.NAME = "LAGVEValue";
        
        // YUI Attribute configuration
        LAGVE.Elements.Value.ATTRS = {
            content : {
                value: null,
            },
        }
         
        Y.extend(LAGVE.Elements.Value, Base, {
            // Prototype methods
         
            // init() lifecycle phase
            initializer : function(cfg) {
                this.set('content', cfg.content);
                
                this._box = Y.Node.create(
                    '<div class="yui-lagve-value">' +
                    this.content +
                    '</div>'
                );
                
                this._box.plug(
                    Y.Plugin.Drop,
                    {
                        groups: ['value'],
                    }
                );  
            },
         
            // destroy() lifecycle phase
            destructor : function() {}
        });
        
        LAGVE.Elements.Value = Y.Base.build(
            LAGVE.Elements.Value.NAME, 
            LAGVE.Elements.Value, 
            [ContextDeletable]
        );
    }
});
/*

    
ContextInerts
    abstract whatCanBeInserted?()


        
Integer
    is a Value
    
String
    is a Value
    
Model
    UM | GM | DM | PM | CM 
    
Concept
    Concept

Attribute
    is a Value
    (Model.)*(Concept.)?Value
    Concept
    UI item overriding Value
    yui Widget
    
Condition
    can be dragged into any ConditionContainer and ConditionList
    is ContextDeletable
    
Statement
    can be dragged into StatementList
    is ContextDeletable
    yui Base

Boolean
    is a Value
    is a Condition
    true|false
    yui Base
    
AttributeContainer
    here ContextInerts Attributes
    yui Widget

ValueContainer
    here ContextInerts Values
    UI item
        drop target interacting with Value
    yui Widget

ConditionContainer
    Condition
    here ContextInerts Conditions
    event when Condition is dragged into it, it resizes to accommodate (by inserting the Condition)
    yui Widget

ConditionList
    Condition+
    here ContextInerts Conditions
    yui Widget

StatementList
    Statement+
    here ContextInerts Statements
    event when Statement is dragged into it, it resizes to accommodate (by inserting the Statement)
    yui Widget
    
Assignment
    is a Statement
    Attribute Operator Value
    UI item
    yui Widget
    
Comparison
    is a Condition
    Value Comparator Value
    yui Widget

Conjunction
    is a Condition
    ConditionContainer AND ConditionCondition
    yui Widget

Disjunction
    is a Condition
    ConditionContainer OR ConditionCondition
    yui Widget

Enough
    is a Condition
    ConditionList Integer
    yui Widget

If-Then-Else
    is a Statement
    ConditionContainer StatementList StatementList?

While
    is a Statement
    Condition StatementList
    yui Widget
*/