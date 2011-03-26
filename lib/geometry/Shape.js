/**
 * Shape is a geometrical object
 * with more than one Point
 * a position, rotation, and scale
 */
Ext.define('geometry.Shape', {

    extend: 'geometry.Path',
    config: {
        rotation: 0,
        scale: 1
    },
    constructor: function (conf) {
        this.initConfig(conf);
        this.callParent([conf]);
    }

});
