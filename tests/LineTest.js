/*global TestCase geometry fail assertTrue*/
/*jslint newcap:false*/
Ext.require('geometry.Line');
Ext.onReady(function () {
    TestCase("LineTest", {
        testConstructor: function () {
            var line = new geometry.Line();
            //fail("this should fail");
            assertNotNull("Ensure constructor returns an object", line);
        }
    });
});
