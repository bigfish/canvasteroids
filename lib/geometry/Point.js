Ext.define('geometry.Point', {
    extend: 'oop.InitProps',
    constructor: function (props) {
        console.log("Point()");
        this.callParent([Ext.applyIf(props, {
            x: 0,
            y: 0
        })]);
    }
});
