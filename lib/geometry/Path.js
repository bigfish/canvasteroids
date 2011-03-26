Ext.define('geometry.Path', {

    extend: 'geometry.Point',

    constructor: function (conf) {
        this.initConfig(conf);
        this.callParent([conf]);
    },

    config: {
        points: []
    },

    addPoint: function (pt) {
        this._points.push(pt);
    },

    getPoint: function (idx) {
        return this._points[idx];
    },

    clearPoints: function () {
        this.setPoints([]);
    },

    setPointsFromArray: function (array) {
        this.clearPoints();
        Ext.Array.forEach(array, function (p) {
            this.addPoint(Ext.create('geometry.Point', {
                x: p.x,
                y: p.y
            }));
        }, this);
    }

});
