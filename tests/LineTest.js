/*global TestCase geometry fail assertTrue*/
/*jslint newcap:false*/

TestCase("LineTest", {
    testConstructor: function () {
        var line = new geometry.Line();
        assertNotNull("Ensure constructor returns an object", line);
    }
});
