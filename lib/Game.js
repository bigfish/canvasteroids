/*global canvasutils canvasteroids controller geometry renderer events */
Ext.require('canvasutils.CanvasUtils', function () {
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

    //get sound effects
/*  var SFX = require("canvasteroids/sfx");
    SFX.defineSounds({
        'test': 'sounds/test.mp3'
    });
    //when loaded and ready...
    SFX.ready(function () {
        SFX.play('test');
    });
*/
    //states --> functions assigned below
    //var START_GAME, START_LEVEL, START_LIFE, PLAY, END_LIFE, END_LEVEL;
    //common functions used in all states
/*o = {
        x: x,
        y: y,
        num_points: n,
        radius: r,
        speed: s,
        size: 3|2|1
    }
*/
    //handle keyboard
    //initialize canvas and clear screen
    Ext.define('canvasteroids.Game', {

        extend: 'canvasutils.Context2D',

        requires: ['events.EventBus', 'canvasutils.CanvasUtils', 'canvasteroids.Rock', 'canvasteroids.Ship', 'canvasteroids.ShipFragment', 'canvasteroids.Bullet', 'renderer.CanvasRenderer', 'geometry.Plane', 'controller.Keyboard'],

        constructor: function (props) {
            this.callParent([props]);
            this.rocks = [];
            this.bullets = [];
            var self = this;
            //handle window resizes
            window.onresize = function () {
                var lastTime;
                if (lastTime) {
                    clearInterval(lastTime);
                }
                lastTime = setTimeout(function () {
                    self.state('resize');
                }, 200);
            };


            //make Plane and Renderer
            this.plane = new geometry.Plane({
                x: 0,
                y: 0,
                width: this.canvas_width,
                height: this.canvas_height
            });

            this.renderer = new renderer.CanvasRenderer({
                plane: this.plane,
                context: this
            });

            this.keyboard = new controller.Keyboard({
                context: this,
                keyPress: this.onKeyPress,
                keyUp: this.onKeyUp
            });

            this.ship = new canvasteroids.Ship({
                active: false,
                context: this,
                strokeStyle: "#FF0000"
            });
            this.plane.addShape(this.ship);

            console.log(events.EventBus);
            events.EventBus.defineEvent('bulletExpired');
            events.EventBus.subscribe('bulletExpired', this.onBulletExpired, this);

        },
        startLevel: function () {
            this.makeRocks();
            this.changeState(this.PLAY);
        },

        changeState: function (newState) {
            if (this.state) {
                this.state('exit');
            }
            this.state = newState;
            this.state('enter');
        },

        stopTimer: function () {
            if (TIMER) {
                clearInterval(TIMER);
            }
            TIMER = null;
        },

        coastIsClear: function () {
            var rx, ry;
            var safeSpace = 100;
            var rock;
            for (var r = 0; r < this.rocks.length; r++) {
                rock = this.rocks[r];
                if (!rock.active) {
                    continue;
                }
                rx = rock.x;
                ry = rock.y;
                if (rx > this.ship.x - safeSpace && rx < this.ship.x + safeSpace && ry > this.ship.y - safeSpace && ry < this.ship.y + safeSpace) {
                    return false;
                }
            }
            return true;
        },

        addRock: function (rock) {
            this.rocks.push(rock);
            this.plane.addShape(rock);
        },

        removeRock: function (rock) {
            Ext.Array.remove(this.rocks, rock);
            this.plane.removeShape(rock);
        },

        removeAllRocks: function () {
            Ext.Array.forEach(this.rocks, function (rock) {
                this.removeRock(rock);
            }, this);
        },

        makeRocks: function () {

            this.removeAllRocks();
            var num_rocks = Math.round(LEVEL * 0.25 * 24);
            var rock;
            for (var r = 0; r < num_rocks; r++) {

                rock = new canvasteroids.Rock({
                    strokeStyle: '#00FF00',
                    context: this,
                    x: RND(this.canvas_width),
                    y: RND(this.canvas_height),
                    size: 3,
                    speed: 1
                });

                //do not clobber ship
                if (this.ship && this.state === this.START_LEVEL && polygonsIntersect(this.ctx, rock, this.ship)) {
                    num_rocks++;
                    continue;
                }

                this.addRock(rock);
            }
        },

        start: function () {
            this.changeState(this.START_GAME);
        },

        drawStartButton: function () {

            var btn_width = 100;
            var btn_height = 40;
            var m = this.ctx.measureText('PLAY'); //gets width only... height is font size
            var ctx = this.ctx;
            //save the current state so we can restore it later
            ctx.save();
            //draw text
            ctx.beginPath();
            ctx.translate(this.canvas_width / 2 - btn_width / 2, this.canvas_height / 2 - btn_height / 2);
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#00FF00";
            ctx.fillText('PLAY', (btn_width - m.width) / 2, (btn_height - 30) / 2);
            //draw box - this remains as the active path after the function returns
            ctx.beginPath();
            ctx.rect(0, 0, btn_width, btn_height);
            ctx.stroke();
            //restore previous context state
            ctx.restore();
        },

        onBulletExpired: function (bullet) {
            console.log("onBulletExpired");
            this.removeBullet(bullet);
        },
        //todo: make collection of shapes
        addBullet: function (bullet) {
            this.bullets.push(bullet);
            this.plane.addShape(bullet);
        },

        removeBullet: function (bullet) {
            Ext.Array.remove(this.bullets, bullet);
            this.plane.removeShape(bullet);
        },

        removeAllBullets: function () {
            Ext.Array.forEach(this.bullets, function (bullet) {
                this.removeBullet(bullet);
            }, this);
        },

        fireBullet: function () {
            var bulletSpeed = 8;
            //bullet should initially be at the tip of the space ship
            //moving away (up) 
            var r = this.ship.rotation - Math.PI / 2;
            var h = this.ship.height / 2;
            this.addBullet(new canvasteroids.Bullet({
                dx: 0,
                dy: 0,
                x: this.ship.x + h * Math.cos(r),
                y: this.ship.y + h * Math.sin(r),
                vx: this.ship.vx + bulletSpeed * Math.cos(r),
                vy: this.ship.vy + bulletSpeed * Math.sin(r),
                plane: this.plane
            }));
        },

        bulletHitRock: function (rock) {
            var bullet, ctx;
            ctx = this.ctx;
            for (var i = 0; i < this.bullets.length; i++) {
                bullet = this.bullets[i];
                //this function is called while the current transformation matrix
                //has a translation applied to it, so we need to use the polyfill
                rock.activatePath(ctx);
                if (isPointInPath(ctx, bullet.x, bullet.y, rock.x, rock.y)) {
                    this.removeBullet(bullet);
                    return true;
                }
            }
            return false;

        },

        explodeRock: function (rock) {
            var newRock, rock_conf;
            //only create new rocks if it is not the smallest size
            if (rock.size > 1) {
                for (var i = 0; i < 3; i++) {
                    this.addRock(new canvasteroids.Rock({
                        context: this,
                        x: rock.x,
                        y: rock.y,
                        size: rock.size - 1,
                        speed: RND(3),
                        parent: rock
                    }));
                }
            }
            this.removeRock(rock);
        },

        hitRock: function (ship, rock) {
            //check if ship is out of range first
            //before doing more expensive detection
            var range = ship.height + rock.radius; //minimum proximity for collision to occur
            if (Math.abs(ship.x - rock.x) > range || Math.abs(ship.y - rock.y) > range) {
                return false;
            } else {
                return polygonsIntersect(this.ctx, rock, ship);
            }
        },

        rocksLeft: function () {
            return this.rocks.length > 0;
        },

        bulletsLeft: function () {
            return this.bullets.length > 0;
        },

        startTimer: function () {
            var me = this;
            //don't stop if already started
            if (!TIMER) {
                TIMER = setInterval(function () {
                    me.state('tick');
                }, 1000 / FPS);
            }
        },

        explodeShip: function (ship) {

            this.ship.active = false;
            this.shipFragments = [new canvasteroids.ShipFragment({
                x: ship.x + ship.points[0].x,
                y: ship.y + ship.points[0].y,
                av: RND(0.05) - RND(0.025),
                rotation: Math.atan2(ship.points[1].y, ship.points[1].x),
                length: Math.sqrt((ship.width / 2) * (ship.width / 2) + ship.height * ship.height),
                vx: RND(2) - Math.random(),
                vy: RND(2) - Math.random()
            }), new canvasteroids.ShipFragment({
                x: ship.x + ship.points[1].x,
                y: ship.y + ship.points[1].y,
                av: RND(0.05) - RND(0.025),
                rotation: Math.atan2(ship.points[2].y, ship.points[2].x),
                length: Math.sqrt((ship.width / 2) * (ship.width / 2) + ship.height * ship.height),
                vx: RND(2) - Math.random(),
                vy: RND(2) - Math.random()
            }), new canvasteroids.ShipFragment({
                x: ship.x + ship.points[0].x,
                y: ship.y + ship.points[0].y,
                av: RND(0.05) - RND(0.025),
                rotation: 0,
                length: ship.width,
                vx: RND(2) - Math.random(),
                vy: RND(2) - Math.random()
            })];
            this.plane.addShapes(this.shipFragments);
        },

        handleInput: function (event) {
            switch (event) {

            case 'right_keypress':
                this.ship.turnRight();
                break;

            case 'left_keypress':
                this.ship.turnLeft();
                break;

            case 'left_keyup':
                this.ship.stopTurningLeft();
                break;

            case 'right_keyup':
                this.ship.stopTurningRight();
                break;

            case 'up_keypress':
                this.ship.startThrust();
                break;

            case 'up_keyup':
                this.ship.stopThrust();
                break;

            case 'spacebar':
                this.fireBullet();
                break;

            case 'resize':
                this.resize();
                this.reset();
                break;

            default:

            }
        },

        onKeyPress: function (key) {

            switch (key) {
            case 'left':
                this.state('left_keypress');
                break;

            case 'right':
                this.state('right_keypress');
                break;

            case 'up':
                this.state('up_keypress');
                break;

            case 'space':
                this.state('spacebar');
                break;

            default:
                // code
            }
        },

        onKeyUp: function (key) {

            switch (key) {
            case 'left':
                this.state('left_keyup');
                break;

            case 'right':
                this.state('right_keyup');
                break;

            case 'up':
                this.state('up_keyup');
                break;

            default:
                // code
            }
        },

        START_GAME: function (msg) {
            var me = this;

            function onClick(event) {
                var x = event.clientX - me.canvas.offsetLeft;
                var y = event.clientY - me.canvas.offsetTop;

                if (me.state === me.START_GAME) {
                    me.drawStartButton();
                    if (me.ctx.isPointInPath(x, y)) {
                        me.changeState(me.START_LIFE);
                    }
                }
            }

            switch (msg) {

            case 'enter':
                this.makeRocks();
                this.startTimer();
                this.canvas.addEventListener('click', Ext.Function.bind(onClick, this), false);
                break;

            case 'tick':
                this.reset();
                this.drawStartButton();
                this.plane.update();
                this.renderer.render(this.plane);
                break;

            case 'exit':
                this.canvas.removeEventListener('click', Ext.Function.bind(onClick, this), false);
                break;

            default:
                this.handleInput(msg);
            }
        },


        END_LEVEL: function (msg) {
            var me = this;
            switch (msg) {

            case 'enter':
                setTimeout(function () {
                    me.startLevel();
                }, 5000);
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.plane.update();
                this.renderer.render(this.plane);
                break;

            case 'exit':
                break;

            default:
                this.handleInput(msg);
            }
        },


        START_LIFE: function (msg) {

            switch (msg) {

            case 'enter':
                this.ship.init();
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.plane.update();
                this.renderer.render(this.plane);
                if (this.coastIsClear()) {
                    this.changeState(this.PLAY);
                }
                break;

            case 'resize':
                this.resize();
                this.reset();
                break;

            case 'exit':
                break;

            default:
            }
        },

        PLAY: function (msg) {

            switch (msg) {

            case 'enter':
                this.ship.active = true;
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.plane.update();
                for (var r = 0; r < this.rocks.length; r++) {
                    var rock = this.rocks[r];
                    //check for collisions
                    if (this.hitRock(this.ship, rock)) {
                        this.explodeShip(this.ship);
                        this.changeState(this.END_LIFE);
                    }
                    if (this.bulletHitRock(rock)) {
                        this.explodeRock(rock);
                    }
                }
                this.renderer.render(this.plane);

                if (!this.rocksLeft()) {
                    this.changeState(this.END_LEVEL);
                }
                break;

            case 'exit':

                this.stopTimer();
                break;

            default:
                this.handleInput(msg);
            }

        },

        END_LIFE: function (msg) {
            var me = this;
            switch (msg) {

            case 'enter':
                this.startTimer();
                //set time-limit on this state
                setTimeout(function () {
                    me.changeState(me.START_LIFE);
                }, 5000);
                break;

            case 'tick':
                this.reset();
                //call update on all shapes in the plane
                this.plane.update();
                this.renderer.render(this.plane);
                break;

            case 'resize':

                this.resize();
                this.reset();
                break;

            case 'exit':
                //remove ship fragments
                this.plane.removeShapes(this.shipFragments);
                break;

            default:
            }
        }

    });

});
