/**
 * renders Shapes to a Context2D
 */
Ext.define('renderer.CanvasRenderer', {

    config: {
        context: null,
        plane: null
    },

    constructor: function (config) {
        this.initConfig(config);
        this.callParent([config]);
    },

    drawShape: function (shape /*drawable shape*/ ) {

        var ctx = this._context.ctx;
/*arguments.callee.counter = arguments.callee.counter ? arguments.callee.counter + 1 : 1;
        if (arguments.callee.counter < 10) {
            console.log("ctx", ctx);
        }*/
        ctx.save();

        var startPoint = shape.getPoint(0);
        var pathPoints = shape.getPoints().slice(1);
        if (shape.getStrokeStyle()) {
            ctx.strokeStyle = shape.getStrokeStyle();
        }
        if (shape.getFillStyle()) {
            ctx.fillStyle = shape.getFillStyle();
        }
        ctx.translate(shape.x, shape.y);
        if (shape.getRotation()) {
            ctx.rotate(shape.getRotation());
        }
        ctx.beginPath();

        ctx.moveTo(startPoint.x, startPoint.y);

        Ext.Array.forEach(pathPoints, function (pt, idx, arr) {
            ctx.lineTo(pt.x, pt.y);
        });

        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    },

    clear: function () {
        this._context.ctx.reset();
    },

    render: function (plane) {
        if (this._plane && this._context) {
            Ext.Array.forEach(this._plane.getShapes(), function (shape) {
                this.drawShape(shape);
            }, this);
        }
    }

});
