(function () {
    var canvas, canvas_width, canvas_height, ctx, state;
    var TWO_PI = Math.PI * 2;
    var RND = function (max) {
        return Math.random() * max;
    };
    var FPS = 30;
    var LEVEL = 1;
    var TIMER;
    var MAX_BULLETS = 100;
    var rocks = [];
    var bullets = [];
    var ship;

    //common functions used in all states

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
        stopTimer();
        TIMER = setInterval(function () {
            state('tick');
        }, 1000 / FPS);
    }

    //classes
    var Rock = function (x, y, num_points, radius, speed) {

        var min_radius = radius * 0.7;
        var var_radius = radius * 0.3;

        this.num_points = num_points;
        this.ang_incr = TWO_PI / this.num_points;
        this.x = x;
        this.y = y;
        this.points = [];
        this.bearing = RND(TWO_PI);
        this.vx = speed * Math.cos(this.bearing);
        this.vy = speed * Math.sin(this.bearing);
        for (var p = 0; p < this.num_points - 1; p++) {
            this.points.push(min_radius + RND(var_radius));
        }
    };

    Rock.prototype.move = function () {
        this.x += this.vx;
        this.y += this.vy;
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

    Rock.prototype.draw = function () {

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();

        ctx.moveTo(0, this.points[0]);

        for (var p = 0; p < this.num_points - 1; p++) {
            ctx.rotate(this.ang_incr);
            ctx.lineTo(0, this.points[p]);
        }

        ctx.closePath();
        ctx.stroke();
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
        this.turn_speed = TWO_PI / 120;
        this.rotation = 0;
        this.rv = 0;
        this.vx = 0;
        this.vy = 0;
        this.acc = 0;
        this.vel = 0;
        this.mass = 5;
        this.force = 0;
        this.friction = 0.98;
        this.thrust = false;
    };

    Ship.prototype.draw = function () {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, this.height / 2);
        ctx.lineTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
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

            this.vx += ax;
            this.vy += ay;

            this.x += this.vx;
            this.y += this.vy;

        } else {

            this.x += this.vx;
            this.y += this.vy;
        }

/*if (this.vx) {

            if (Math.abs(this.vx) > 0.01) {
                this.x += this.vx;
            } else {
                this.vx = 0;
            }
        }

        if (this.vy) {

            if (Math.abs(this.vy) > 0.01) {
                this.y += this.vy;
            } else {
                this.vy = 0;
            }
        }*/

    };

    Ship.prototype.fire = function () {
        var bulletSpeed = 5;
        console.log("fire");
        //bullet should initially be at the tip of the space ship
        //moving away (up) 
        var r = this.rotation - Math.PI / 2;
        var h = this.height / 2;
        if (bullets.length < MAX_BULLETS) {
            var bullet = {
                x: this.x + h * Math.cos(r),
                y: this.y + h * Math.sin(r),
                vx: bulletSpeed * Math.cos(r),
                vy: bulletSpeed * Math.sin(r),
                active: true,
                dx: 0,
                dy: 0
            };
            bullets.push(bullet);
        }
    };


    //state functions
    //states --> functions assigned below
    var PRE_GAME, PRE_PLAY, PLAY;

    function changeState(newState) {
        if (state) {
            state('exit');
        }
        state = newState;
        state('enter');
    }

    PRE_GAME = function (msg) {

        //private functions

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
                if (ctx.isPointInPath(x, y)) {
                    //changeState(PRE_PLAY);
                    changeState(PLAY);
                }
            }
        }


        //handle messages
        switch (msg) {

        case 'enter':
            drawStartButton();
            canvas.addEventListener('click', onClick, false);
            break;

        case 'resize':
            resize();
            reset();
            drawStartButton();
            break;

        case 'exit':
            console.log("exit::PRE_GAME");
            canvas.removeEventListener('click', onClick, false);
            reset();
            break;

        default:
        }
    };


    PRE_PLAY = function (msg) {

        function coastIsClear() {
            var rx, ry;
            var safeSpace = 100;
            //debug - draw safeSpace
            ctx.save();
            ctx.beginPath();
            ctx.translate(canvas_width / 2 - safeSpace, canvas_height / 2 - safeSpace);
            ctx.rect(0, 0, safeSpace * 2, safeSpace * 2);
            ctx.stroke();
            ctx.restore();
            //end debug
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
            //create rocks
            rocks = [];
            var num_rocks = Math.round(LEVEL * 0.25 * 48);
            for (var r = 0; r < num_rocks; r++) {
                rocks.push(new Rock(RND(canvas_width), RND(canvas_height), 16, 60, 1));
            }

            //ship
            ship = new Ship();
            ship.init();
            ship.draw();
        }


        //handle messages
        switch (msg) {

        case 'enter':
            makeRocks();
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

            stopTimer();
            break;

        default:
            // code
        }
    };

    PLAY = function (msg) {

        function updateBullets() {
            var bullet;
            ctx.save();
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
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(bullet.x, bullet.y, 2, 2);
            }
            ctx.restore();
        }

        //handle messages
        switch (msg) {

        case 'enter':
            console.log("enter::PLAY");
            ship = new Ship();
            ship.init();
            startTimer();
            break;

        case 'tick':
            reset();
            for (var r = 0; r < rocks.length; r++) {
                rocks[r].move();
                rocks[r].checkWrap();
                rocks[r].draw();
            }
            updateBullets();
            ship.update();
            ship.draw();
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
