/**
 * keeps track of a drag operation
 * - is a Vector2D from the start to the last updated pos
 *
 * - updatePos(x, y);
 */
Ext.define('interactive.Drag', {
    extend: 'geometry.Vector2',
    constructor: function (props) {
        this.callParent(this.applyProps(props, {

        }));
    }

});
