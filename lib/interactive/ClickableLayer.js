Ext.define('interactive.ClickableLayer', {
    extend: 'drawable.Layer',
    constructor: function (props) {
        this.callParent([props]);

        //assume W3C event model
        //does not support IE < 9 since it has no canvas anyways... use Chrome Frame
        var layer = this;
        var surface = this.canvas;
        this.canvas.addEventListener('click', function (event) {
            //get coords realtive to the canvas
            var x = event.clientX - surface.offsetLeft;
            var y = event.clientY - surface.offsetTop;
            //detect if any shapes were hit by click
            layer.items.forEach(function (shape) {
                if (shape.active && shape.clickable) {
                    if (shape.containsPoint(layer.ctx, x, y)) {
                        //fire click event
                        shape.click(x - shape.x, y - shape.y);
                    }
                }
            });
        }, false);
    }
});
