/**
 * Shape is some geometrical shape
 * with  stroke, & fill attributes
 * which can be drawn by a Renderer
 */
Ext.define('drawable.DrawableShape', {
    extend: 'geometry.Shape',
    requires: ['geometry.Square'],
    constructor: function (props) {
        this.initProps(props, {
            shape: 'geometry.Square',
            fillStyle: '#000000',
            strokeStyle: '#00FF00'
        });
    }
});
