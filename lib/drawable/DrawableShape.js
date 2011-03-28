Ext.define('drawable.DrawableShape', {

    beforeDraw: function (ctx) {
        ctx.save();
        //apply shape transform to context
        ctx.translate(this.x, this.y);
        if (this.strokeStyle) {
            ctx.strokeStyle = this.strokeStyle;
        }
        if (this.fillStyle) {
            ctx.fillStyle = this.fillStyle;
        }
        if (this.rotation && this.rotation) {
            ctx.rotate(this.rotation);
        }
    },

    draw: function (ctx) {
        this.beforeDraw(ctx);

        //draw closed path
        var startPoint = this.getPoint(0);
        var pathPoints = this.points.slice(1);
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        Ext.Array.forEach(pathPoints, function (pt, idx, arr) {
            ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.stroke();

        this.afterDraw(ctx);
    },

    afterDraw: function (ctx) {
        ctx.restore();
    }
});
