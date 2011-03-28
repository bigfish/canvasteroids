/**
 * Plane is a 2D surface
 * which contains Shapes
 * if 'wrap' is true, shapes will 
 * wrap their positions if they 
 * move out of the boundaries of the plane
 */
Ext.define('geometry.Plane', {
    extend: 'geometry.Square',
    constructor: function (props) {
        console.log("Plane()");
        this.callParent([Ext.applyIf(props, {
            wrap: false,
            shapes: []
        })]);
    },
    addShape: function (shape) {
        this.shapes.push(shape);
    },
    getShapeAt: function (idx) {
        return this.shapes[idx];
    },
    removeShapeAt: function (idx) {
        this.shapes.splice(idx, 1);
    },
    removeShape: function (shape) {
        //remove shape object passed as parameter
        if (Ext.Array.contains(this.shapes, shape)) {
            this.removeShapeAt(this.shapes.indexOf(shape));
        }
    }
});