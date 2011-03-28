/**
 * renders Shapes to a Context2D
 */
Ext.define('renderer.CanvasRenderer', {

    extend: 'oop.InitProps',
    constructor: function (props) {
        this.callParent([props]);
    },

    clear: function () {
        this.context.ctx.reset();
    },

    render: function (plane) {
        if (this.plane && this.context) {
            Ext.Array.forEach(this.plane.shapes, function (shape) {
                shape.draw(this.context.ctx);
            }, this);
        }
    }

});
