/*global IS_POINT_IN_PATH*/
(function () {
    var canvas, canvas_width, canvas_height, ctx, state;
    var TWO_PI = Math.PI * 2;
    var RND = function (max) {
        return Math.random() * max;
    };
    var FPS = 30;
    var LEVEL = 1;
    var TIMER;
    var MAX_BULLETS = 25;
    var MAX_SPEED = 15;
    var rocks = [];
    var bullets = [];
    var ship;
    //states --> functions assigned below
    var PRE_GAME, PRE_PLAY, PLAY;


    //common functions used in all states

    function changeState(newState) {
        if (state) {
            state('exit');
        }
        state = newState;
        state('enter');
    }
    //check intersection of two shapes
    //shapes must have .points array 
    //and .x .y properties (global coordinates)

    function _polygonsIntersect(shape1, shape2) {
        if (!arguments.callee.count) {
            arguments.callee.count = 1;
        }
        if (++arguments.callee.count === 100) {
            console.log(shape1, shape2);
        }
        var intersect = false;
        var pts1 = shape1.points,
            pts2 = shape2.points;

        ctx.save();
        ctx.translate(shape1.x, shape1.y);
        //activate shape1 by drawing a path with its points
        ctx.beginPath();
        ctx.moveTo(pts1[0][0], pts1[0][1]);
        for (var i = 0; i < pts1.length; i++) {
            var pt = pts1[i];
            ctx.lineTo(pt[0], pt[1]);
        }
        ctx.closePath();
        //check if any of shape2's points intersect with it
        for (var j = 0; j < pts2.length; j++) {
            pt = pts2[j];
            if (IS_POINT_IN_PATH(ctx, shape2.x + pt[0], shape2.y + pt[1], shape1.x, shape1.y)) {
                intersect = true;
                break;
            }
        }
        ctx.restore();
        return intersect;
    }

    function polygonsIntersect(shape1, shape2) {
        return _polygonsIntersect(shape1, shape2) || _polygonsIntersect(shape2, shape1);
    }

    function init() {

        canvas = document.getElementsByTagName('canvas')[0];
        ctx = canvas.getContext('2d');

    }

    function resize() {

        canvas_width = document.documentElement.clientWidth;
        canvas_height = document.documentElement.clientHeight;
        canvas.setAttribute('width', canvas_width);
        canvas.setAttribute('height', canvas_height);

    }

    function reset() {

        ctx.fillRect(0, 0, canvas_width, canvas_height);
        ctx.strokeStyle = '#00FF00';
        ctx.font = "24px Verdana,Arial,sans-serif";
    }

    function stopTimer() {
        if (TIMER) {
            clearInterval(TIMER);
        }
    }

    function startTimer() {
        //don't stop if already started
        if (!TIMER) {
            TIMER = setInterval(function () {
                state('tick');
            }, 1000 / FPS);
        }
    }


/*o = {
        x: x,
        y: y,
        num_points: n,
        radius: r,
        speed: s,
        size: 3|2|1
    }
*/
    var Rock = function (o, parent) {
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
            this.radius = 10;
        }
        var min_radius = this.radius * 0.7;
        var var_radius = this.radius * 0.3;
        this.ang_incr = TWO_PI / this.num_points;
        this.points = [];
        var r = 0;
        for (var p = 0; p < this.num_points; p++) {
            r += this.ang_incr;
            var radius = min_radius + RND(var_radius);
            this.points.push([radius * Math.cos(r), radius * Math.sin(r)]);
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
    };

    Rock.prototype.move = function () {
        this.x += this.vx;
        this.y += this.vy;
    };

    Rock.prototype.hit = function () {
        var bullet;
        for (var i = 0; i < bullets.length; i++) {
            bullet = bullets[i];
            if (!bullet.active) {
                continue;
            }
            //this function is called while the current transformation matrix
            //has a translation applied to it, so we need to use the polyfill
            if (IS_POINT_IN_PATH(ctx, bullet.x, bullet.y, this.x, this.y)) {
                bullet.active = false;
                return true;
            }
        }
        return false;
    };

    Rock.prototype.checkWrap = function () {
        var buffer = 200;

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
    };

    Rock.prototype.draw = function (col) {
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
        if (this.hit()) {
            rocks.push(new Rock({
                x: this.x,
                y: this.y,
                size: this.size - 1,
                speed: RND(3)
            }, this), new Rock({
                x: this.x,
                y: this.y,
                size: this.size - 1,
                speed: RND(3)
            }, this), new Rock({
                x: this.x,
                y: this.y,
                size: this.size - 1,
                speed: RND(3)
            }, this));
            this.size = 0;
        } else {
            ctx.stroke();
        }
        ctx.restore();
    };

    //Ship
    var Ship = function () {
        this.height = 25;
        this.width = 15;
        this.baseAngle = Math.atan2(this.height, this.width / 2);
    };

    Ship.prototype.init = function () {
        this.x = canvas_width / 2;
        this.y = canvas_height / 2;
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
        this.points = [
            [-this.width / 2, this.height / 2],
            [0, -this.height / 2],
            [this.width / 2, this.height / 2]
        ];
        this.exploding = false;
    };

    Ship.prototype.draw = function () {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(this.points[0][0], this.points[0][1]);
        ctx.lineTo(this.points[1][0], this.points[1][1]);
        ctx.lineTo(this.points[2][0], this.points[2][1]);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    };
    //get points in global coordinate space
    Ship.prototype.getPoints = function () {
        return this.points;
    };

    Ship.prototype.rotate = function (dir) {
        this.rv = dir * this.turn_speed;
    };

    Ship.prototype.turnRight = function () {
        this.rotate(1);
    };

    Ship.prototype.turnLeft = function () {
        this.rotate(-1);
    };

    Ship.prototype.stopTurning = function () {
        this.rotate(0);
    };

    Ship.prototype.startThrust = function () {
        this.thrust = true;
        this.force = -1.1; //-y direction
    };

    Ship.prototype.stopThrust = function () {
        this.thrust = false;
        this.force = 0;
    };

    Ship.prototype.update = function () {
        var accel, orientation, ax, ay;
        var max_vel = 5;
        this.rotation += this.rv;

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
    };

    Ship.prototype.fire = function () {
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
    };

    Ship.prototype.explode = function () {
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
    };


    function coastIsClear() {
        var rx, ry;
        var safeSpace = 100;
        for (var r = 0; r < rocks.length; r++) {
            rx = rocks[r].x;
            ry = rocks[r].y;
            if (rx > canvas_width / 2 - safeSpace && rx < canvas_width / 2 + safeSpace && ry > canvas_height / 2 - safeSpace && ry < canvas_height / 2 + safeSpace) {
                return false;
            }
        }
        return true;
    }

    function makeRocks() {
        rocks = [];
        var num_rocks = Math.round(LEVEL * 0.25 * 48);
        for (var r = 0; r < num_rocks; r++) {
            rocks.push(new Rock({
                x: RND(canvas_width),
                y: RND(canvas_height),
                size: 3,
                speed: 1
            }));
        }
    }

    function drawStartButton() {

        var btn_width = 100;
        var btn_height = 40;
        var m = ctx.measureText('PLAY'); //gets width only... height is font size
        //save the current state so we can restore it later
        ctx.save();
        //draw text
        ctx.beginPath();
        ctx.translate(canvas_width / 2 - btn_width / 2, canvas_height / 2 - btn_height / 2);
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
    }


    function onClick(event) {
        var x = event.clientX - canvas.offsetLeft;
        var y = event.clientY - canvas.offsetTop;

        if (state === PRE_GAME) {
            drawStartButton();
            if (ctx.isPointInPath(x, y)) {
                changeState(PRE_PLAY);
                //changeState(PLAY);
            }
        }
    }

    PRE_GAME = function (msg) {

        //private functions
        //handle messages
        switch (msg) {

        case 'enter':
            makeRocks();
            startTimer();
            canvas.addEventListener('click', onClick, false);
            break;

        case 'tick':
            reset();
            drawStartButton();
            for (var r = 0; r < rocks.length; r++) {
                rocks[r].move();
                rocks[r].checkWrap();
                rocks[r].draw();
            }
            break;

        case 'resize':
            resize();
            reset();
            drawStartButton();
            break;

        case 'exit':
            console.log("exit::PRE_GAME");
            canvas.removeEventListener('click', onClick, false);
            break;

        default:
        }
    };


    PRE_PLAY = function (msg) {


        //handle messages
        switch (msg) {

        case 'enter':
            startTimer();
            break;

        case 'tick':
            reset();
            for (var r = 0; r < rocks.length; r++) {
                rocks[r].move();
                rocks[r].checkWrap();
                rocks[r].draw();
            }
            if (coastIsClear()) {
                changeState(PLAY);
            }
            break;

        case 'resize':

            resize();
            reset();
            break;

        case 'exit':

            break;

        default:
            // code
        }
    };

    PLAY = function (msg) {

        function updateBullets() {
            //TODO: make Bullet class?
            var bullet;
            for (var b = 0; b < bullets.length; b++) {
                bullet = bullets[b];
                if (!bullet.active) {
                    continue;
                }
                bullet.x += bullet.vx;
                bullet.y += bullet.vy;
                bullet.dx += Math.abs(bullet.vx);
                bullet.dy += Math.abs(bullet.vy);
                if (bullet.dx > canvas_width * 0.8 || bullet.dy > canvas_height * 0.8) {
                    bullet.active = false;
                    continue;
                }
                //do wrapping
                if (bullet.x < 0) {
                    bullet.x += canvas_width;
                } else if (bullet.x > canvas_width) {
                    bullet.x -= canvas_width;
                }
                if (bullet.y < 0) {
                    bullet.y += canvas_height;
                } else if (bullet.y > canvas_height) {
                    bullet.y -= canvas_height;
                }
            }
        }

        function drawBullets() {
            var bullet;
            ctx.save();
            ctx.fillStyle = '#00FF00';
            for (var b = 0; b < bullets.length; b++) {
                bullet = bullets[b];
                if (!bullet.active) {
                    continue;
                }
                ctx.fillRect(bullet.x, bullet.y, 2, 2);
            }
            ctx.restore();
        }

        function hitRock(ship, rock) {
            //check if ship is out of range first
            //before doing more expensive detection
            var range = ship.height + rock.radius; //minimum proximity for collision to occur
            if (Math.abs(ship.x - rock.x) > range || Math.abs(ship.y - rock.y) > range) {
                return false;
            } else {
                return polygonsIntersect(rock, ship);
            }

        }
        //handle messages
        switch (msg) {

        case 'enter':
            console.log("enter::PLAY");
            ship = new Ship();
            ship.init();
            break;

        case 'tick':
            reset();
            updateBullets();
            for (var r = 0; r < rocks.length; r++) {
                var rock = rocks[r];
                if (rock.size) {
                    rock.move();
                    rock.checkWrap();
                    if (hitRock(ship, rock)) {
                        ship.explode();
                    }
                    rock.draw();
                }
            }
            drawBullets();
            if (ship.exploding) {
                ship.explode();
            } else {
                ship.update();
                ship.draw();
            }
            break;

        case 'right_keypress':
            ship.turnRight();
            break;

        case 'left_keypress':
            ship.turnLeft();
            break;

        case 'left_keyup':
        case 'right_keyup':
            ship.stopTurning();
            break;

        case 'up_keypress':
            ship.startThrust();
            break;

        case 'up_keyup':
            ship.stopThrust();
            break;

        case 'spacebar':
            ship.fire();
            break;

        case 'resize':
            resize();
            reset();
            break;

        case 'exit':

            stopTimer();
            break;

        default:
            // code
        }

    };


    //initialize canvas and clear screen
    init();
    resize();
    reset();

    changeState(PRE_GAME);

    //handle window resizes
    window.onresize = function () {
        var lastTime;
        if (lastTime) {
            clearInterval(lastTime);
        }
        lastTime = setTimeout(function () {
            state('resize');
        }, 200);
    };

    //handle keyboard
    var keys = {
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        32: 'space',
        19: 'pause',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    function getKey(e) {
        var evt = e || event;
        var key = keys[evt.keyCode];
        return key || '';
    }

    function onKeyPress(e) {
        var key = getKey(e);

        switch (key) {
        case 'left':
            state('left_keypress');
            break;

        case 'right':
            state('right_keypress');
            break;

        case 'up':
            state('up_keypress');
            break;

        case 'space':
            state('spacebar');
            break;

        default:
            // code
        }
    }

    function onKeyUp(e) {
        var key = getKey(e);

        switch (key) {
        case 'left':
            state('left_keyup');
            break;

        case 'right':
            state('right_keyup');
            break;

        case 'up':
            state('up_keyup');
            break;

        default:
            // code
        }
    }
    document.onkeydown = onKeyPress;
    document.onkeyup = onKeyUp;

})();
