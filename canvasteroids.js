(function () {
    var canvas, canvas_width, canvas_height, ctx;

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

    function clear() {

        ctx.fillRect(0, 0, canvas_width, canvas_height);
    }

    init();
    resize();
    clear();

    window.onresize = function () {
        var lastTime;
        if (lastTime) {
            clearInterval(lastTime);
        }
        lastTime = setTimeout(function () {
            resize();
            clear();
        }, 200);

    };

})();
