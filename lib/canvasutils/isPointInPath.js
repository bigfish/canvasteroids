/*global define*/
/**
 * Utility functions for use in Canvas apps
 *
 * Version: 0.1
 * Author: David Wilhelm
 * Github repo: 
 *
 * Uses Require.js to provide a module object
 * with the following properties/methods:
 * 
 * IS_POINT_IN_PATH_MODE: String, either
 * 'none' ==> no support for isPointInPath(x, y)
 * 'global' ==> translates current path to global coordinates
 *              before doing detection
 * 'local' ==> detects given point in local coordinates
 *             (in the current transformation matrix)
 *
 * isPointInPath(ctx, x, y, x_offset, y_offset)
 * ==> provides normalized implementation of isPointInPath
 *     NB: requires x_offset, y_offset args, which are the 
 *     x,y of the local origin in global co-ordinates
 *
 * polygonsIntersect(ctx, shape1, shape2)
 * ==> does collision detection between 2 'shapes'
 * which are closed polygons. Teh shape objects must
 * have the following properties:
 *  - x : x position (in global coords) of shape
 *  - y : y position (in global coords) of shape
 *  - points : array of points forming the polygon path
 *  each point is a 2-element array of [x,y] number values
 *
 *  Note that the methods take a 'ctx' Canvas 2D context
 *  as the first argument
 */

/**
 * IS_POINT_IN_PATH
 *  Determine whether the coordinates used in canvas's isPointInPath(x,y) 
 *  method use global coordinates (eg. Chrome) or the present tranformation matrix (eg. Firefox)
 *  this will result in the export of a global variable IS_POINT_IN_PATH_MODE with the values:
 *  'global', 'local', or 'none'
 *  construct a test case by pushing onto the stack
 *  translating right and down by 10 pixels,
 *  then creating a 10x10 rect.
 *  if a call to isPointInPath(5,5) returns true
 *  then the mode is LOCAL
 *  if the coords 15,15 return true, then the mode is GLOBAL
 *  if neither, isPointInPath does not work at all (NONE)
 */

define(function (require) {

    var IS_POINT_IN_PATH_MODE = 'none';
    var isPointInPath;

    var canvas, context;
    canvas = document.createElement('canvas');
    if (canvas && canvas.getContext) {
        context = canvas.getContext('2d');
        context.save();
        context.translate(10, 10);
        context.rect(0, 0, 10, 10);
        if (context.isPointInPath(5, 5)) {
            IS_POINT_IN_PATH_MODE = 'local';
        } else if (context.isPointInPath(15, 15)) {
            IS_POINT_IN_PATH_MODE = 'global';
        }

        //define function dynamically based on mode
        isPointInPath = function () {
            if (IS_POINT_IN_PATH_MODE === 'global') {
                //this version will ignore the x_offset, y_offset arguments
                //since they are not needed
                return function (ctx, x, y) {
                    return ctx.isPointInPath(x, y);
                };
            } else if (IS_POINT_IN_PATH_MODE === 'local') {
                //x_offset, y_offset are the global coordinates of the origin
                //of the local transfomration matrix
                //you will have to keep track of this yourself
                //since Canvas does not provide it
                //eg. by using sprites which have global x,y properties
                //or some means of obtaining them
                return function (ctx, x, y, x_offset, y_offset) {
                    return ctx.isPointInPath(x - x_offset, y - y_offset);
                };
            }
        }();
    }

    //return function
    return isPointInPath;

});
