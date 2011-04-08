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
    Ext.define('sprites.Ship', {
        extend: 'geometry.Shape',
        requires: ['sprites.Bullet'],
        mixins: ['motion.Velocity', 'drawable.Drawable'],
        //Ship
        constructor: function (props) {
            this.callParent([Ext.applyIf(props, {
                active: true
            })]);

            this.ctx = this.context.ctx;
            this.height = 25;
            this.width = 15;
            this.baseAngle = Math.atan2(this.height, this.width / 2);
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

        },

        init: function () {
            this.x = this.context.canvas_width / 2;
            this.y = this.context.canvas_height / 2;
            this.turn_speed = TWO_PI / 60;
            this.rotation = 0;
            this.rv = 0;
            this.setVelocity(0, 0);
            this.acc = 0;
            this.mass = 5;
            this.force = 0;
            this.friction = 0.998;
            this.thrust = false;
        },

        reset: function () {
            this.init();
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
            this.rotation = this.rotation + this.rv;
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
            this.move();
            if (this.exploding) {
                this.animateExplosion();
            }
        }

    });

})();