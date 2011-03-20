/*
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

var IS_POINT_IN_PATH_MODE = 'none';
var IS_POINT_IN_PATH;
(function () {
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

        //define global function dynamically based on mode
        IS_POINT_IN_PATH = function () {
            if (IS_POINT_IN_PATH_MODE === 'global') {
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
})();
