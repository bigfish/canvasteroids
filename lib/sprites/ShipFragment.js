Ext.define('sprites.ShipFragment', {
    extend: 'geometry.Point',
    mixins: ['motion.Velocity', 'drawable.Drawable'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            strokeStyle: '#FF0000'
        })]);
    },
    update: function () {
        this.move();
    },
    draw: function (ctx) {
        this.beforeDraw(ctx);
        ctx.save();
        ctx.translate(0, -this.length / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.length);
        ctx.restore();
        ctx.stroke();
        this.afterDraw(ctx);
    }
});
