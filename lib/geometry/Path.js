/*global geometry */
Ext.define('geometry.Path', {

    extend: 'geometry.Point',

    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            points: []
        }));
    },

    addPoint: function (pt) {
        this.points.push(pt);
    },

    getPoint: function (idx) {
        return this.points[idx];
    },

    clearPoints: function () {
        this.points = [];
    },

    setPointsFromArray: function (array) {
        this.clearPoints();
        Ext.Array.forEach(array, function (p) {
            this.addPoint(new geometry.Point({
                x: p.x,
                y: p.y
            }));
        }, this);
    },
    activatePath: function (ctx) {
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
        ctx.restore();
    }

});
