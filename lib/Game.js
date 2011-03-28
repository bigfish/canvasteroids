/*global canvasutils canvasteroids controller geometry renderer */
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

        requires: ['canvasutils.CanvasUtils', 'canvasteroids.Rock', 'canvasteroids.Ship', 'canvasteroids.Bullet', 'renderer.CanvasRenderer', 'geometry.Plane', 'controller.Keyboard'],

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
            var canvas_width = this.canvas_width;
            var canvas_height = this.canvas_height;
            var rx, ry;
            var safeSpace = 80;
            var rock;
            for (var r = 0; r < this.rocks.length; r++) {
                rock = this.rocks[r];
                if (!rock.active) {
                    continue;
                }
                rx = rock.x;
                ry = rock.y;
                if (rx > canvas_width / 2 - safeSpace && rx < canvas_width / 2 + safeSpace && ry > canvas_height / 2 - safeSpace && ry < canvas_height / 2 + safeSpace) {
                    return false;
                }
            }
            return true;
        },

        makeRocks: function () {
            this.rocks = [];
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
                this.rocks.push(rock);
                this.plane.addShape(rock);
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

        fireBullet: function (bullet) {
            //var bullet;
            //if (this.bullets.length < MAX_BULLETS) {
            //create new bullet
            //bullet_conf.plane = this.plane;
            //bullet = Ext.create('canvasteroids.Bullet', bullet_conf);
            bullet.plane = this.plane;
            this.bullets.push(bullet);
            this.plane.addShape(bullet);
            //} else {
            //re-activate inactive bullet
/*for (var i = 0; i < this.bullets.length; i++) {
                    if (!this.bullets[i].active) {
                        bullet = this.bullets[i];
                        *bullet.x = bullet_x;
                        bullet.y = bullet_y;
                        bullet.vx = bullet_vx;
                        bullet.vy = bullet_vy;<]
                    }
                }*/
            //}
        },

        updateBullets: function () {
            var bullets = this.bullets;
            var bullet;
            for (var b = 0; b < bullets.length; b++) {
                bullet = bullets[b];
                if (!bullet.active) {
                    continue;
                }
                bullet.update();
            }
        },

        animateRocks: function () {
            for (var r = 0; r < this.rocks.length; r++) {
                var rock = this.rocks[r];
                if (rock.size) {
                    rock.move();
                    rock.checkWrap();
                }
            }
        },

        bulletHitRock: function (rock) {
            var bullet, ctx;
            ctx = this.ctx;
            for (var i = 0; i < this.bullets.length; i++) {
                bullet = this.bullets[i];
                //ignore dead bullets
                if (!bullet.active) {
                    continue;
                }
                //this function is called while the current transformation matrix
                //has a translation applied to it, so we need to use the polyfill
                rock.activatePath(ctx);
                if (isPointInPath(ctx, bullet.x, bullet.y, rock.x, rock.y)) {
                    bullet.active = false;
                    return true;
                }
            }
            return false;

        },
        explodeRock: function (rock) {
            var newRock;
            for (var i = 0; i < 3; i++) {
                if (rock.size > 1) {
                    newRock = new canvasteroids.Rock({
                        context: this,
                        x: rock.x,
                        y: rock.y,
                        size: rock.size - 1,
                        speed: RND(3),
                        parent: rock
                    });
                    this.rocks.push(newRock);
                    this.plane.addShape(newRock);
                }
            }
            //remove exploded rock
            this.rocks.splice(this.rocks.indexOf(rock), 1);
            this.plane.removeShape(rock);
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
            for (var i = 0; i < this.rocks.length; i++) {
                if (this.rocks[i].size) {
                    return true;
                }
            }
            return false;
        },

        bulletsLeft: function () {
            for (var i = 0; i < this.bullets.length; i++) {
                if (this.bullets[i].active) {
                    return true;
                }
            }
            return false;
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
                this.ship.fire();
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
                this.animateRocks();
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
                this.updateBullets();
                this.animateRocks();
                this.ship.update();
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
                this.ship = new canvasteroids.Ship({
                    context: this,
                    strokeStyle: "#FF0000"
                });
                this.plane.addShape(this.ship);
                this.ship.init();
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.animateRocks();
                if (this.coastIsClear()) {
                    this.changeState(this.PLAY);
                }
                this.renderer.render(this.plane);
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
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.updateBullets();
                for (var r = 0; r < this.rocks.length; r++) {
                    var rock = this.rocks[r];
                    if (rock.size) {
                        rock.move();
                        rock.checkWrap();
                        //check for collisions
                        if (this.hitRock(this.ship, rock)) {
                            this.plane.removeShape(this.ship);
                            this.changeState(this.END_LIFE);
                        }
                        if (this.bulletHitRock(rock)) {
                            this.explodeRock(rock);
                        }

                    }
                }
                this.ship.update();

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
                this.updateBullets();
                this.animateRocks();
                this.ship.explode();

                this.renderer.render(this.plane);
                break;

            case 'resize':

                this.resize();
                this.reset();
                break;

            case 'exit':
                this.ship.exploding = false;
                break;

            default:
            }
        }

    });

});
