/**
 * renders Shapes to a Context2D
 */
Ext.define('renderer.CanvasRenderer', {

    extend: 'oop.InitProps',
    constructor: function (props) {
        this.callParent([props]);
    },
    drawShape: function (shape /*drawable shape*/ ) {

        var ctx = this.context.ctx;
        ctx.save();
        //apply shape transform to context
        ctx.translate(shape.x, shape.y);
        if (shape.strokeStyle) {
            ctx.strokeStyle = shape.strokeStyle;
        }
        if (shape.fillStyle) {
            ctx.fillStyle = shape.fillStyle;
        }
        if (shape.rotation && shape.rotation) {
            ctx.rotate(shape.rotation);
        }
        //use shape's draw method if it exists
        if (shape.draw) {
            shape.draw(ctx);
        } else {
            //draw closed path
            var startPoint = shape.getPoint(0);
            var pathPoints = shape.points.slice(1);
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            Ext.Array.forEach(pathPoints, function (pt, idx, arr) {
                ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
    },

    clear: function () {
        this.context.ctx.reset();
    },

    render: function (plane) {
        if (this.plane && this.context) {
            Ext.Array.forEach(this.plane.shapes, function (shape) {
                this.drawShape(shape);
            }, this);
        }
    }

});
