/*global canvasutils canvasteroids*/
(function () {

    var TWO_PI = Math.PI * 2;
    var RND = function (max) {
        return Math.random() * max;
    };

    //require utilities
    var isPointInPath = canvasutils.CanvasUtils.isPointInPath;
    var polygonsIntersect = canvasutils.CanvasUtils.polygonsIntersect;

    Ext.define('canvasteroids.Rock', {
        extend: 'drawable.DrawableShape',
        requires: ['canvasutils.CanvasUtils'],
        constructor: function (o) {
            this.initConfig(o);
            this.callParent([o]);

            var parent = o.parent;
            this.context = o.context;
            this.ctx = this.context.ctx;
            this.x = o.x;
            this.y = o.y;
            this.size = o.size; //3 -> big, 2 -> med, 1 -> small, 0 -> destroyed
            if (this.size === 3) {
                this.num_points = 16;
                this.radius = 60;
            } else if (this.size === 2) {
                this.num_points = 12;
                this.radius = 30;
            } else if (this.size === 1) {
                this.num_points = 6;
                this.radius = 8;
            }
            var min_radius = this.radius * 0.7;
            var var_radius = this.radius * 0.3;
            this.ang_incr = TWO_PI / this.num_points;
            var r = 0;
            for (var p = 0; p < this.num_points; p++) {
                r += this.ang_incr;
                var radius = min_radius + RND(var_radius);
                this.addPoint({
                    x: radius * Math.cos(r),
                    y: radius * Math.sin(r)
                });
            }
            if (parent) {
                this.bearing = (parent.bearing + RND(TWO_PI)) / 2;
                this.vx = (parent.vx + o.speed) * Math.cos(this.bearing);
                this.vy = (parent.vy + o.speed) * Math.sin(this.bearing);
            } else {
                this.bearing = RND(TWO_PI);
                this.vx = o.speed * Math.cos(this.bearing);
                this.vy = o.speed * Math.sin(this.bearing);
            }
        },

        move: function () {
            this.x += this.vx;
            this.y += this.vy;
        },

        hit: function () {
            var bullet;
            var bullets = this.context.bullets || [];
            for (var i = 0; i < bullets.length; i++) {
                bullet = bullets[i];
                if (!bullet.active) {
                    continue;
                }
                //this function is called while the current transformation matrix
                //has a translation applied to it, so we need to use the polyfill
                if (isPointInPath(this.ctx, bullet.x, bullet.y, this.x, this.y)) {
                    bullet.active = false;
                    return true;
                }
            }
            return false;
        },

        checkWrap: function () {
            var buffer = this.radius;
            var canvas_width = this.context.canvas_width;
            var canvas_height = this.context.canvas_height;

            if (this.x > canvas_width + buffer) {
                this.x = -buffer;
            } else if (this.x < -buffer) {
                this.x = canvas_width + buffer;
            }

            if (this.y > canvas_height + buffer) {
                this.y = -buffer;
            } else if (this.y < -buffer) {
                this.y = canvas_height + buffer;
            }
        },

        draw: function (col) {
            var Rock = canvasteroids.Rock;
            var ctx = this.ctx;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            if (col) { //debug
                ctx.strokeStyle = col;
            }
            ctx.moveTo(this.points[0][0], this.points[0][1]);

            for (var p = 1; p < this.num_points; p++) {
                ctx.lineTo(this.points[p][0], this.points[p][1]);
            }

            ctx.closePath();

            //break up the rock into smaller ones
            //we have to get a ref to the rocks collection of the game (context)
/*      if (this.hit(this.context.bullets)) {
                this.context.rocks.push(new Rock({
                    context: this.context,
                    x: this.x,
                    y: this.y,
                    size: this.size - 1,
                    speed: RND(3),
                    parent: this
                }), new Rock({
                    context: this.context,
                    x: this.x,
                    y: this.y,
                    size: this.size - 1,
                    speed: RND(3),
                    parent: this
                }), new Rock({
                    context: this.context,
                    x: this.x,
                    y: this.y,
                    size: this.size - 1,
                    speed: RND(3),
                    parent: this
                }));
                this.size = 0;
            } else {
                ctx.stroke();
            } */
            ctx.restore();
        }
    });

})();
