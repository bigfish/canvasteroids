/*global describe it beforeEach expect */
describe("Breakout Game Tests", function () {

    var breakout;

    beforeEach(function () {
        breakout = Ext.create('breakout.Breakout');
    });

    it("should exist", function () {
        expect(breakout).toBeDefined();
    });

    it("should have a game layer", function () {
        expect(breakout.gameLayer).toBeDefined();
    });
/*

    it("should display the game title", function () {
        expect(breakout.startButton.active).toBeTruthy();
    });

    it("should display a start button", function () {
        expect(breakout.startButton.active).toBeTruthy();
    });*/

});
