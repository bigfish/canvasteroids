Ext.define('drawable.DrawableSquare', {

    extend: 'geometry.Square',
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            fillStyle: "#FF0000",
            strokeStyle: "#FF0000"
        })]);
    },

    draw: function (ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(0, 0, this.width, this.height);
    }

});