/**
 * Plane is a 2D surface
 * which contains Shapes
 * if 'wrap' is true, shapes will 
 * wrap their positions if they 
 * move out of the boundaries of the plane
 */
Ext.define('geometry.Plane', {
    extend: 'geometry.Square',
    config: {
        wrap: false,
        shapes: []
    },
    constructor: function (config) {
        this.initConfig(config);
        this.callParent([config]);
    },
    addShape: function (shape) {
        this._shapes.push(shape);
    },
    getShapeAt: function (idx) {
        return this._shapes[idx];
    },
    removeShapeAt: function (idx) {
        this._shapes.splice(idx, 1);
    },
    removeShape: function (shape) {
        //remove shape object passed as parameter
        if (Ext.Array.contains(this._shapes, shape)) {
            this.removeShapeAt(this._shapes.indexOf(shape));
        }
    }
});
