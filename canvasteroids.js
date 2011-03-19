(function () {
    var canvas, canvas_width, canvas_height, ctx, state;
    var TWO_PI = Math.PI * 2;
    var RND = function (max) {
        return Math.random() * max;
    };
    var FPS = 30;
    //initialize data structures
    var LEVEL = 0;
    var TIMER;
    var rocks = [];

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


    //state functions
    //states --> functions assigned below
    var PRE_GAME, PLAY;

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
            if (ctx.isPointInPath(x, y)) {
                changeState(PLAY);
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
            canvas.removeEventListener('click', onClick, false);
            reset();
            break;

        default:
        }
    };


    PLAY = function (msg) {

        function startLevel() {
            LEVEL++;
            rocks = [];
            var num_rocks = Math.round(LEVEL * 0.25 * 64);
            for (var r = 0; r < num_rocks; r++) {
                rocks.push(new Rock(RND(canvas_width), RND(canvas_height), 12, 80, 3));
            }
        }

        //handle messages
        switch (msg) {

        case 'enter':
            console.log("PLAY::enter");
            startLevel();
            startTimer();
            break;

        case 'tick':
            reset();
            for (var r = 0; r < rocks.length; r++) {
                rocks[r].move();
                rocks[r].checkWrap();
                rocks[r].draw();
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

})();
