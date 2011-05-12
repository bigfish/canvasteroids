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
    }

});
