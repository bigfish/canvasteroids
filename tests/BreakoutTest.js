/*global TestCase Breakout fail games assertTrue*/
/*jslint newcap:false*/
Ext.require("games.breakout.Breakout");
Ext.onReady(function () {
    var instance;
    TestCase("BreakoutTest", {
        setUp: function () {
            instance = new games.breakout.Breakout();
        },
        testConstructor: function () {
            assertNotNull("Ensure constructor returns an object", instance);
        },
        testInit: function () {

        }
    });

});
