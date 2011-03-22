/*global define*/
define(function (require) {
    //check intersection of two shapes
    //shapes must have .points array 
    //and .x .y properties (global coordinates)
    var IS_POINT_IN_PATH = require("canvas-utils/isPointInPath");

    function _polygonsIntersect(ctx, shape1, shape2) {
        if (!arguments.callee.count) {
            arguments.callee.count = 1;
        }
        if (++arguments.callee.count === 100) {
            console.log(shape1, shape2);
        }
        var intersect = false;
        var pts1 = shape1.points,
            pts2 = shape2.points;

        ctx.save();
        ctx.translate(shape1.x, shape1.y);
        //activate shape1 by drawing a path with its points
        ctx.beginPath();
        ctx.moveTo(pts1[0][0], pts1[0][1]);
        for (var i = 0; i < pts1.length; i++) {
            var pt = pts1[i];
            ctx.lineTo(pt[0], pt[1]);
        }
        ctx.closePath();
        //check if any of shape2's points intersect with it
        for (var j = 0; j < pts2.length; j++) {
            pt = pts2[j];
            if (IS_POINT_IN_PATH(ctx, shape2.x + pt[0], shape2.y + pt[1], shape1.x, shape1.y)) {
                intersect = true;
                break;
            }
        }
        ctx.restore();
        return intersect;
    }

    //retun the function
    return function (ctx, shape1, shape2) {
        return _polygonsIntersect(ctx, shape1, shape2) || _polygonsIntersect(ctx, shape2, shape1);
    };

});
