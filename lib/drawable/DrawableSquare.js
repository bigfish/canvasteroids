/*global canvasutils */
Ext.define('drawable.DrawableSquare', {

    extend: 'geometry.Square',
    mixins: ['drawable.Drawable'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            fillStyle: "#FF0000",
            strokeStyle: "#FF0000",
            context: null
        })]);
        //this is a base drawable class -- set context
        this.initDrawable(this.context);
    },
    //slightly optimized method for drawing a square, useful when drawing lots of points
    draw: function () {
        this.beforeDraw();
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.afterDraw();
    }
});
