/*global TestCase assertFalse assertTrue jstestdriver */
var testCase = TestCase;
testCase("CanvasUtilsTests", {
    testA: function () {
        assertTrue("this should be true", true);
        //jstestdriver.console.log("This is a jstd log statement");
    },

    testB: function () {
        assertTrue("this should be true", true);
    },

    testC: function () {
        assertFalse("this should be false", false);
    }
});
