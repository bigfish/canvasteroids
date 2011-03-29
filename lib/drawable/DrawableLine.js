Ext.define('drawable.DrawableLine', {
    extend: 'geometry.Line',
    mixins: 'drawable.Drawable',
    constructor: function (props) {
        this.callParent([props]);
    },
    draw: function (ctx) {
        this.beforeDraw(ctx);
        this.beginPath();
        this.moveTo(this.start.x, this.start.y);
        this.lineTo(this.end.x, this.end.y);
        this.stroke();
        this.afterDraw(ctx);
    }
});
