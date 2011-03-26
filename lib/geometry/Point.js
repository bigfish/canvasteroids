Ext.define('geometry.Point', {
    constructor: function (config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.callParent();
    }
});
