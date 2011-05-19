/*global TestCase geometry fail assertTrue*/
/*jslint newcap:false*/
TestCase("LineTest", {
    testConstructor: function () {
        var line = Ext.create('geometry.Line');
        //fail("this should fail");
        assertNotNull("Ensure constructor returns an object", line);
    }
});
