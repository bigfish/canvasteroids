Ext.define('controller.TouchPad', {
    extend: 'ui.Component',
    mixins: ['interactive.Draggable'],
    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            strokeStyle: "#FF0000",
            width: 200,
            height: 200,
            drags: {} //hash of identifier => Drag objects
        }));
        this.onStartDrag(function (x, y, id) {
            console.log("dragstart", x, y);
            //self.ctx.strokeText(" x:" + x + " y:" + x, 30, 30);
            //self.startDragPos = [x, y];
            //self.lastDragPos = [x, y];
        });
        this.onDrag(function (x, y, id) {
            console.log("drag", x, y);
            //self.ctx.strokeText(" x:" + x + " y:" + x, 30, 30);
            //self.x += x - self.lastDragPos[0];
            //self.y += y - self.lastDragPos[1];
        });
    }

});
