/*global breakout describe it beforeEach expect */
describe("Breakout Game Tests", function () {

    var game;

    beforeEach(function () {
        game = new breakout.Breakout();
    });

    it("should exist", function () {
        expect(game).toBeDefined();
    });

    it("should display the Breakout logo graphic", function () {
        //1. get the Breakout logo bitmap image
        var logo_img = new Image();
        logo_img.onload = function () {

            //2. search the canvas elements in the DOM for the image
            //TODO: use Ext methods for better browser compatibility
            var canvases = document.querySelectorAll("canvas");
            //there must be at least one canvas available
            Array.prototype.forEach.call(canvases, function (canvas) {
                console.log(canvas);
            });
            console.log(canvases);
        };
        logo_img.src = "../games/breakout/images/breakout.png";
    });

});
