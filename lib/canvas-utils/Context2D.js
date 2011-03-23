Ext.define('canvasutils.Context2D', {
    //default config
    config: {
        canvasId: 'canvas',
        width: 640,
        height: 400,
        bg: '#000000',
        fullscreen: true
    },

    resize: function () {

        this.canvas_width = document.documentElement.clientWidth;
        this.canvas_height = document.documentElement.clientHeight;
        this.canvas.setAttribute('width', this.canvas_width);
        this.canvas.setAttribute('height', this.canvas_height);

    },

    reset: function () {

        this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.font = "24px Verdana,Arial,sans-serif";
    },

    constructor: function (config) {
        this.initConfig(config);
        this.canvas = document.getElementById(this.getCanvasId());
        console.log(this.canvas);

        //this will throw an error if it does not work...
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        this.reset();


        return this;
    }
});
