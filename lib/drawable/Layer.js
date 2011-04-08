Ext.define('drawable.Layer', {

    extend: 'canvasutils.Context2D',

    mixins: ['collection.Collection'],

    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            items: [],
            clickable: true
        }));
        if (this.clickable) {
            //assume W3C event model
            //does not support IE < 9 since it has no canvas anyways... use Chrome Frame
            var surface = this.canvas;
            var layer = this;
            this.canvas.addEventListener('click', function (event) {
                console.log("Layer: click", event);
                //get coords realtive to the canvas
                var x = event.clientX - surface.offsetLeft;
                var y = event.clientY - surface.offsetTop;
                //detect if any shapes were hit by click
                layer.items.forEach(function (shape) {
                    //if shape.clickable
                    if (shape.includesPoint) {
                        if (shape.includesPoint(x, y, layer.ctx)) {
                            //fire click event
                            shape.click(x - shape.x, y - shape.y);
                        }
                    }
                });
            });
        }
    },

    update: function () {
        this.forEach(function (shape) {
            if (shape.active === false) {
                return;
            }
            if (shape.update) {
                shape.update();
            }
        });
    },

    render: function () {
        var shape;
        for (var i = 0; i < this.items.length; i++) {
            shape = this.items[i];
            if (shape.active === false) {
                continue;
            } else {
                shape.draw(this.ctx);
            }
        }
    }


});
