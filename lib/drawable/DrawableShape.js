/**
 * Shape is some geometrical shape
 * defined by its 'shape' property
 * which is a instance of geometry.Shape
 * with  stroke, & fill attributes
 * which can be drawn by a Renderer
 */
Ext.define('drawable.DrawableShape', {
    extend: 'geometry.Shape',
    config: {
        fillStyle: '',
        strokeStyle: ''
    },
    constructor: function (conf) {
        this.initConfig(conf || {});
        this.callParent([conf]);
    }
});
