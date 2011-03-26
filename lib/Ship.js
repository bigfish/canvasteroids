/*global canvasutils canvasteroids*/
(function () {
    var TWO_PI = Math.PI * 2;
    var RND = function (max) {
        return Math.random() * max;
    };
    var FPS = 30;
    var LEVEL = 1;
    var TIMER;
    var MAX_BULLETS = 25;
    var MAX_SPEED = 15;

    //require utilities
    var isPointInPath = canvasutils.CanvasUtils.isPointInPath;
    var polygonsIntersect = canvasutils.CanvasUtils.polygonsIntersect;
    Ext.define('canvasteroids.Ship', {
        extend: 'drawable.DrawableShape',
        //Ship
        constructor: function (conf) {
            this.initConfig(conf);
            this.callParent([conf]);

            this.context = conf.context;
            this.ctx = this.context.ctx;
            this.height = 25;
            this.width = 15;
            this.baseAngle = Math.atan2(this.height, this.width / 2);

        },

        init: function () {
            this.x = this.context.canvas_width / 2;
            this.y = this.context.canvas_height / 2;
            this.turn_speed = TWO_PI / 60;
            this.rotation = 0;
            this.rv = 0;
            this.vx = 0;
            this.vy = 0;
            this.acc = 0;
            this.mass = 5;
            this.force = 0;
            this.friction = 0.998;
            this.thrust = false;
            this.setPointsFromArray([Ext.create('geometry.Point', {
                x: -this.width / 2,
                y: this.height / 2
            }), Ext.create('geometry.Point', {
                x: 0,
                y: -this.height / 2
            }), Ext.create('geometry.Point', {
                x: this.width / 2,
                y: this.height / 2
            })]);
            this.exploding = false;
        },

        draw: function (ctx) {
/*     ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            ctx.moveTo(this.points[0][0], this.points[0][1]);
            ctx.lineTo(this.points[1][0], this.points[1][1]);
            ctx.lineTo(this.points[2][0], this.points[2][1]);
            ctx.closePath();
            ctx.stroke();
            ctx.restore(); */
        },

        rotate: function (dir) {
            this.rv = dir * this.turn_speed;
        },

        turnRight: function () {
            this.rotate(1);
        },

        turnLeft: function () {
            this.rotate(-1);
        },

        stopTurningRight: function () {
            //only stop turning if currently turning right
            //so as not to break turning left
            if (this.rv > 0) {
                this.rotate(0);
            }
        },

        stopTurningLeft: function () {
            if (this.rv < 0) {
                this.rotate(0);
            }
        },

        startThrust: function () {
            this.thrust = true;
            this.force = -1.1; //-y direction
        },

        stopThrust: function () {
            this.thrust = false;
            this.force = 0;
        },

        update: function () {
            var accel, orientation, ax, ay;
            var max_vel = 5;
            this.rotation += this.rv;
            var canvas_width = this.context.canvas_width;
            var canvas_height = this.context.canvas_height;

            if (this.thrust) {
                //force is applied in direction of ships orientation
                //F = ma
                //a = F/m
                accel = this.force / this.mass;
                orientation = this.rotation + Math.PI / 2;
                ax = accel * Math.cos(orientation);
                ay = accel * Math.sin(orientation);
                //apply acceleration to velocity
                this.vx += ax;
                this.vy += ay;
            }
            //wrapping
            if (this.x < 0) {
                this.x += canvas_width;
            } else if (this.x > canvas_width) {
                this.x -= canvas_width;
            }
            if (this.y < 0) {
                this.y += canvas_height;
            } else if (this.y > canvas_height) {
                this.y -= canvas_height;
            }
            //cap speed
            if (this.vx > MAX_SPEED) {
                this.vx = MAX_SPEED;
            } else if (this.vx < -MAX_SPEED) {
                this.vx = -MAX_SPEED;
            }
            if (this.vy > MAX_SPEED) {
                this.vy = MAX_SPEED;
            } else if (this.vy < -MAX_SPEED) {
                this.vy = -MAX_SPEED;
            }
            //update position
            this.x += this.vx;
            this.y += this.vy;
        },

        fire: function () {
            var bullets = this.context.bullets;
            var bullet, bulletSpeed = 5;
            //bullet should initially be at the tip of the space ship
            //moving away (up) 
            var r = this.rotation - Math.PI / 2;
            var h = this.height / 2;
            if (bullets.length < MAX_BULLETS) {
                //create new bullet
                bullet = {};
                bullets.push(bullet);
            } else {
                //re-activate inactive bullet
                for (var i = 0; i < bullets.length; i++) {
                    if (!bullets[i].active) {
                        bullet = bullets[i];
                    }
                }
            }
            bullet.active = true;
            bullet.x = this.x + h * Math.cos(r);
            bullet.y = this.y + h * Math.sin(r);
            bullet.vx = this.vx + bulletSpeed * Math.cos(r);
            bullet.vy = this.vy + bulletSpeed * Math.sin(r);
            bullet.dx = 0;
            bullet.dy = 0;
        },

        explode: function () {
            console.log("*SHIP EXPLODES*");
/*
            var ctx = this.ctx; //alias to keep code readable
            if (!this.exploding) {
                this.exploding = true;
                this.fragments = [{
                    x: this.points[0][0],
                    y: this.points[0][1],
                    ar: RND(0.05) - RND(0.025),
                    rot: Math.atan2(this.points[1][1], this.points[1][1]),
                    len: Math.sqrt((this.width / 2) * (this.width / 2) + this.height * this.height),
                    xv: RND(2) - Math.random(),
                    yv: RND(2) - Math.random()
                },
                {
                    x: this.points[1][0],
                    y: this.points[1][1],
                    ar: RND(0.05) - RND(0.025),
                    rot: Math.atan2(this.points[2][1], this.points[2][1]),
                    len: Math.sqrt((this.width / 2) * (this.width / 2) + this.height * this.height),
                    xv: RND(2) - Math.random(),
                    yv: RND(2) - Math.random()
                },
                {
                    x: this.points[0][0],
                    y: this.points[0][1],
                    ar: RND(0.05) - RND(0.025),
                    rot: 0,
                    len: this.width,
                    xv: RND(2) - Math.random(),
                    yv: RND(2) - Math.random()
                }];
            } else {
                //update animation of fragments
                ctx.save();
                ctx.translate(this.x, this.y);
                for (var f = 0; f < this.fragments.length; f++) {
                    var frag = this.fragments[f];
                    //update position and rotation
                    frag.x += frag.xv;
                    frag.y += frag.yv;
                    frag.rot += frag.ar;
                    //draw
                    ctx.save();
                    ctx.translate(frag.x, frag.y);
                    ctx.rotate(frag.rot);
                    ctx.translate(0, -frag.len / 2);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, frag.len);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.restore();
            }
            */
        }

    });

})();
