/*global canvasutils */
Ext.define('drawable.DrawableSquare', {

    extend: 'geometry.Square',
    mixins: ['drawable.Drawable'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            fillStyle: "#FF0000",
            strokeStyle: "#FF0000"
        })]);
    },

    draw: function (ctx) {
        this.beforeDraw(ctx);

        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(0, 0, this.width, this.height);

        this.afterDraw(ctx);
    },

    activatePath: function (ctx) {
        console.log("activatePath", ctx);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.rect(0, 0, this.width, this.height);
        ctx.restore();
    },

    includesPoint: function (x, y, ctx) {
        console.log("includesPoint", ctx, x, y);
        //determine if the point is within the shape 
        this.activatePath(ctx);
        return canvasutils.CanvasUtils.isPointInPath(ctx, x, y, this.x, this.y);
    }

});
