/*global canvasteroids controller sprites geometry renderer eventbus drawable ui interactive soundeffects */
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
    //initialize canvas and clear screen
    Ext.define('Asteroids', {

        extend: 'oop.InitProps',

        requires: ['eventbus.EventBus', 'soundeffects.SoundEffects', 'sprites.Rock', 'sprites.Ship', 'sprites.ShipFragment', 'sprites.Bullet', 'drawable.Layer', 'controller.Keyboard', 'ui.Button', 'interactive.DraggableLayer'],

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

            this.gameLayer = new interactive.DraggableLayer({
                x: 0,
                y: 0,
                fullscreen: true,
                canvasId: this.canvasId,
                stroke: this.stroke
            });

            this.keyboard = new controller.Keyboard({
                context: this,
                keyPress: this.onKeyPress,
                keyUp: this.onKeyUp
            });

            this.ship = new sprites.Ship({
                active: false,
                context: this.gameLayer,
                strokeStyle: "#FF0000"
            });
            this.gameLayer.add(this.ship);

            eventbus.EventBus.defineEvent('bulletExpired');
            eventbus.EventBus.subscribe('bulletExpired', this.onBulletExpired, this);

            this.startButton = new ui.Button({
                text: "Play",
                width: 120,
                height: 40,
                x: this.gameLayer.width / 2 - 100,
                y: this.gameLayer.height / 2 - 20,
                active: false,
                context: this.gameLayer
            });
            this.gameLayer.add(this.startButton);

            soundeffects.SoundEffects.defineSounds({
                'laser': '../../lib/sounds/laser.mp3',
                'rock_explode': '../../lib/sounds/explode.mp3',
                'thrust': '../../lib/sounds/thrust.mp3',
                'boom': '../../lib/sounds/boom.mp3',
                'asteroids_loop': '../../lib/sounds/asteroids_loop.mp3'
            });

            this.sfx = soundeffects.SoundEffects;
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
            this.gameLayer.add(rock);
        },

        removeRock: function (rock) {
            Ext.Array.remove(this.rocks, rock);
            this.gameLayer.remove(rock);
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

                rock = new sprites.Rock({
                    strokeStyle: '#00FF00',
                    context: this.gameLayer,
                    x: RND(this.gameLayer.canvas_width),
                    y: RND(this.gameLayer.canvas_height),
                    size: 3,
                    speed: 1
                });

                //do not clobber ship
                if (this.ship && this.state === this.START_LEVEL && rock.intersects(this.ship)) {
                    num_rocks++;
                    continue;
                }

                this.addRock(rock);
            }
        },

        start: function () {
            this.changeState(this.START_GAME);
        },

        onBulletExpired: function (bullet) {
            this.removeBullet(bullet);
        },

        addBullet: function (bullet) {
            this.bullets.push(bullet);
            this.gameLayer.add(bullet);
        },

        removeBullet: function (bullet) {
            Ext.Array.remove(this.bullets, bullet);
            this.gameLayer.remove(bullet);
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
            this.addBullet(new sprites.Bullet({
                dx: 0,
                dy: 0,
                x: this.ship.x + h * Math.cos(r),
                y: this.ship.y + h * Math.sin(r),
                vx: this.ship.vx + bulletSpeed * Math.cos(r),
                vy: this.ship.vy + bulletSpeed * Math.sin(r),
                context: this.gameLayer
            }));
            this.sfx.play('laser');
        },

        bulletHitRock: function (rock) {
            var bullet, ctx;
            ctx = this.gameLayer.ctx;
            for (var i = 0; i < this.bullets.length; i++) {
                bullet = this.bullets[i];
                //this function is called while the current transformation matrix
                //has a translation applied to it, so we need to use the polyfill
                if (rock.containsPoint(bullet.x, bullet.y)) {
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
                    this.addRock(new sprites.Rock({
                        context: this.gameLayer,
                        x: rock.x,
                        y: rock.y,
                        size: rock.size - 1,
                        speed: RND(3),
                        parent: rock
                    }));
                }
            }
            this.removeRock(rock);
            this.sfx.play('rock_explode');
        },

        hitRock: function (ship, rock) {
            //check if ship is out of range first
            //before doing more expensive detection
            var range = ship.height + rock.radius; //minimum proximity for collision to occur
            if (Math.abs(ship.x - rock.x) > range || Math.abs(ship.y - rock.y) > range) {
                return false;
            } else {
                return ship.intersects(rock);
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

        resize: function () {

            //recenter button
            this.startButton.x = this.gameLayer.canvas_width / 2 - this.startButton.width / 2;
            this.startButton.y = this.gameLayer.canvas_height / 2 - this.startButton.height / 2;
            this.gameLayer.resize();
        },

        reset: function () {
            this.gameLayer.reset();
        },

        explodeShip: function (ship) {

            this.ship.active = false;
            this.shipFragments = [new sprites.ShipFragment({
                x: ship.x + ship.points[0].x,
                y: ship.y + ship.points[0].y,
                av: RND(0.05) - RND(0.025),
                rotation: Math.atan2(ship.points[1].y, ship.points[1].x),
                length: Math.sqrt((ship.width / 2) * (ship.width / 2) + ship.height * ship.height),
                vx: RND(2) - Math.random(),
                vy: RND(2) - Math.random(),
                context: this.gameLayer
            }), new sprites.ShipFragment({
                x: ship.x + ship.points[1].x,
                y: ship.y + ship.points[1].y,
                av: RND(0.05) - RND(0.025),
                rotation: Math.atan2(ship.points[2].y, ship.points[2].x),
                length: Math.sqrt((ship.width / 2) * (ship.width / 2) + ship.height * ship.height),
                vx: RND(2) - Math.random(),
                vy: RND(2) - Math.random(),
                context: this.gameLayer
            }), new sprites.ShipFragment({
                x: ship.x + ship.points[0].x,
                y: ship.y + ship.points[0].y,
                av: RND(0.05) - RND(0.025),
                rotation: 0,
                length: ship.width,
                vx: RND(2) - Math.random(),
                vy: RND(2) - Math.random(),
                context: this.gameLayer
            })];
            this.gameLayer.add(this.shipFragments);
            this.sfx.play('boom');
        },
        //TODO: handle touch events
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
                this.sfx.play('thrust');
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

            this.startButton.active = true;
            this.startButton.onClick(function () {
                this.changeState(this.START_LIFE);
            }, this);

            switch (msg) {

            case 'enter':
                this.makeRocks();
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.gameLayer.update();
                this.gameLayer.render();
                break;

            case 'exit':
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
                this.gameLayer.update();
                this.gameLayer.render();
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
                this.startButton.active = false;
                this.ship.init();
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.gameLayer.update();
                this.gameLayer.render();
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
                this.gameLayer.update();
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
                this.gameLayer.render();

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
                this.gameLayer.update();
                this.gameLayer.render();
                break;

            case 'resize':

                this.resize();
                this.reset();
                break;

            case 'exit':
                //remove ship fragments
                this.gameLayer.remove(this.shipFragments);
                break;

            default:
            }
        }

    });

})();
