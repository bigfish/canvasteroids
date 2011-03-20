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
    }
})();
