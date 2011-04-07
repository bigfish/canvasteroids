/**
 * requires that the host class has an items[] array
 * which will be managed by the methods:
 * add()
 * remove()
 * contains()
 * forEach()
 */
Ext.define('collection.Collection', {

    add: function (item) {
        if (Ext.isArray(item)) {
            Ext.Array.forEach(item, function (it) {
                Ext.Array.include(this.items, it);
            }, this);
        } else {
            Ext.Array.include(this.items, item);
        }
    },

    remove: function (item) {
        if (Ext.isArray(item)) {
            Ext.Array.forEach(item, function (it) {
                Ext.Array.remove(this.items, it);
            }, this);
        } else {
            Ext.Array.remove(this.items, item);
        }
    },

    contains: function (item) {
        return Ext.Array.contains(this.items, item);
    },

    forEach: function (fn, ctx) {
        Ext.Array.forEach(this.items, fn, ctx || this);
    },
    asArray: function () {
        return Ext.Array.clone(this.items);
    }
});
