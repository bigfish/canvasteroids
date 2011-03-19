(function () {
    var canvas, canvas_width, canvas_height, ctx, state;

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
        switch (msg) {
        case 'enter':

            break;

        case 'exit':

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


})();
