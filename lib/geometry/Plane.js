/**
 * Plane is a 2D surface
 * which contains Shapes
 * TODO: if 'wrap' is true, shapes will 
 * wrap their positions if they 
 * move out of the boundaries of the plane
 */
Ext.define('geometry.Plane', {
    extend: 'geometry.Square',
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            wrap: false,
            shapes: []
        })]);
    },
    addShape: function (shape) {
        this.shapes.push(shape);
    },
    addShapes: function (shapes) {
        this.shapes = this.shapes.concat(shapes);
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
    },
    removeShapes: function (shapes) {
        Ext.Array.forEach(shapes, function (shape) {
            this.removeShape(shape);
        }, this);
    },
    update: function () {
        Ext.Array.forEach(this.shapes, function (shape) {
            if (shape.active === false) {
                return;
            }
            if (shape.update) {
                shape.update();
            }
        });
    }
});
