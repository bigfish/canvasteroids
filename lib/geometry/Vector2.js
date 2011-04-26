Ext.define('geometry.Vector', {
    extend: 'geometry.Line',
    constructor: function (props) {
        this.applyProps(props, {
            angle: 0
        });
    }
});
