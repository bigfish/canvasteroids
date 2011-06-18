/*global describe it beforeEach expect */
describe("Breakout Game Tests", function () {

    var breakout;

    beforeEach(function () {
        breakout = Ext.create('breakout.Breakout');
    });

    it("should exist", function () {
        expect(breakout).toBeDefined();
    });

});
