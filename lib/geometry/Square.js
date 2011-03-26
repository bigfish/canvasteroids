/*global geometry */
Ext.define('geometry.Square', {

    extend: 'geometry.Path',
    requires: ['geometry.Point'],
    config: {
        width: 100,
        height: 100
    },
    constructor: function (config) {
        this.initConfig(config);
        this.callParent([config]);
        this.setPointsFromArray([{
            x: 0,
            y: 0
        },
        {
            x: config.width,
            y: 0
        },
        {
            x: config.width,
            y: config.height
        },
        {
            x: 0,
            y: config.height
        }]);
    }

});
