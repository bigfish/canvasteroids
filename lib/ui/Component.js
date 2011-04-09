/**
 * Components are similar in functionality to Sprites
 * but they are also Clickable and inherit from Square
 */
Ext.define('ui.Component', {
    extend: 'geometry.Square',
    mixins: ['drawable.Drawable', 'collision.Collision', 'interactive.Clickable'],
    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            active: true,
            clickable: true
        }));
        //this is a base drawable class -- set context (required property)
        this.initDrawable(this.context);
    }
});
