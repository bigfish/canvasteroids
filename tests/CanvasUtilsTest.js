/*global TestCase assertTrue jstestdriver */
var testCase = TestCase;
testCase("CanvasUtilsTests", {
    testA: function () {
        console.log("this is a test");
        assertTrue("this should be true", true);
        jstestdriver.console.log("This is a jstd log statement");
    }
});
