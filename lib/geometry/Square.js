/*global geometry */
Ext.define('geometry.Square', {

    extend: 'geometry.Path',
    requires: ['geometry.Point'],
    config: {
        width: 100,
        height: 100
    },
    constructor: function (props) {
        console.log("Square()");
        this.callParent([props]);

        this.setPointsFromArray([{
            x: 0,
            y: 0
        },
        {
            x: this.getWidth(),
            y: 0
        },
        {
            x: this.getWidth(),
            y: this.getHeight()
        },
        {
            x: 0,
            y: this.getHeight()
        }]);
    }

});
