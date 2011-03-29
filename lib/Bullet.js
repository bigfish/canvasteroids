/*global events */
Ext.define('canvasteroids.Bullet', {
    extend: 'drawable.DrawableSquare',
    mixins: ['motion.Velocity'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            width: 2,
            height: 2,
            dx: 0,
            dy: 0,
            vx: 0,
            vy: 0,
            plane: null
        })]);
    },

    update: function () {
        var plane_width = this.plane.width;
        var plane_height = this.plane.height;
        this.move();
        this.dx += Math.abs(this.vx);
        this.dy += Math.abs(this.vy);

        //expire the bullet after a maximum distance
        if (this.dx > plane_width * 0.6 || this.dy > plane_height * 0.6) {
            events.EventBus.publish('bulletExpired', this);
            return;
        }
        //do wrapping
        if (this.x < 0) {
            this.x += plane_width;
        } else if (this.x > plane_width) {
            this.x -= plane_width;
        }
        if (this.y < 0) {
            this.y += plane_height;
        } else if (this.y > plane_height) {
            this.y -= plane_height;
        }
    }

});
