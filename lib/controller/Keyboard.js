Ext.define('controller.Keyboard', {
    config: {
        context: window,
        keyUp: Ext.emptyFn,
        keyPress: Ext.emptyFn
    },
    statics: {
        keys: {
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            32: 'space',
            19: 'pause',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        },

        getKey: function (e) {
            var evt = e || event;
            var key = this.keys[evt.keyCode];
            return key || '';
        }

    },

    constructor: function (config) {
        this.initConfig(config);
        this.callParent([config]);
        document.onkeydown = Ext.Function.bind(this.onKeyPress, this);
        document.onkeyup = Ext.Function.bind(this.onKeyUp, this);
    },

    onKeyPress: function (e) {
        var key = this.self.getKey(e);
        this._keyPress.call(this._context, key);
    },

    onKeyUp: function (e) {
        var key = this.self.getKey(e);
        this._keyUp.call(this._context, key);
    }


});
