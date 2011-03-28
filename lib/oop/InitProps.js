/**
 * Use this as a base class to enable passing value objects 
 * to constructor functions of subclasses to initialize
 * object properties. A second object is used for default values
 */
Ext.define('oop.InitProps', {

    constructor: function (props) {
        console.log("InitProps()", props);
        if (props) {
            Ext.apply(this, props);
        }
    }

});