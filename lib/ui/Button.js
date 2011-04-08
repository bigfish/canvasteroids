/*global canvasutils */
Ext.define('ui.Button', {

    extend: 'drawable.DrawableSquare',

    mixins: ['interactive.Clickable'],

    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            text: 'Button',
            active: true,
            clickable: true
        }));
    },

    draw: function (ctx) {

        this.beforeDraw(ctx);

        var m = ctx.measureText(this.text); //gets width only... height is font size
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#00FF00";
        ctx.fillText(this.text, (this.width - m.width) / 2, (this.height) / 2);

        //draw box - this remains as the active path after the function returns
        ctx.beginPath();
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();

        this.afterDraw(ctx);
    }
});
