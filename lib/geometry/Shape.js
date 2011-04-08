/*global canvasutils */
/**
 * Shape is a geometrical object
 * with more than one Point
 * a position, rotation, and scale
 */
Ext.define('geometry.Shape', {

    extend: 'geometry.Path',
    requires: ['canvasutils.CanvasUtils'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            rotation: 0,
            scale: 1
        })]);
    },

    containsPoint: function (ctx, x, y) {
        var result;
        ctx.save();
        ctx.translate(this.x, this.y);
        //activate by drawing a path with points
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 0; i < this.points.length; i++) {
            var pt = this.points[i];
            ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        result = canvasutils.CanvasUtils.isPointInPath(ctx, x, y, this.x, this.y);
        ctx.restore();
        return result;
    },

    intersects: function (ctx, otherShape) {
        return canvasutils.CanvasUtils.polygonsIntersect(ctx, this, otherShape);
    }

});
