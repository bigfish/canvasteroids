/*global TestCase Breakout fail games assertTrue*/
/*jslint newcap:false*/
var instance;
TestCase("BreakoutTest", {
    setUp: function () {
        instance = new Ext.create('games.breakout.Breakout');
    },
    testConstructor: function () {
        assertNotNull("Ensure constructor returns an object", instance);
    },
    testInit: function () {

    }
});
