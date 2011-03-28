Ext.define('drawable.DrawableSquare', {

    extend: 'geometry.Square',
    mixins: ['drawable.DrawableShape'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            fillStyle: "#FF0000",
            strokeStyle: "#FF0000"
        })]);
    },

    draw: function (ctx) {
        this.beforeDraw(ctx);
        console.log("draw", this.x, this.y, this.width, this.height, this.fillStyle);
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(0, 0, this.width, this.height);

        this.afterDraw(ctx);
    }

});
