/*global canvasutils */
Ext.define('ui.Button', {

    extend: 'ui.Component',
    mixins: ['interactive.Draggable'],
    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            text: 'Button'
        }));
        var self = this;
        this.onStartDrag(function (x, y) {
            //console.log("dragstart", x, y);
            //self.ctx.strokeText(" x:" + x + " y:" + x, 30, 30);
            self.startDragPos = [x, y];
            self.lastDragPos = [x, y];
        });
        this.onDrag(function (x, y) {
            //console.log("drag", x, y);
            //self.ctx.strokeText(" x:" + x + " y:" + x, 30, 30);
            self.x += x - self.lastDragPos[0];
            self.y += y - self.lastDragPos[1];
        });
    },

    draw: function () {

        this.beforeDraw();

        var m = this.ctx.measureText(this.text); //gets width only... height is font size
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "#00FF00";
        this.ctx.fillText(this.text, (this.width - m.width) / 2, (this.height) / 2);

        //draw box - this remains as the active path after the function returns
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.width, this.height);
        this.ctx.stroke();

        this.afterDraw();
    }
});
