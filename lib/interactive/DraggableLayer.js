/*global interactive */
/**
 * DraggableLayer
 * supports dragging of items with Draggable mixin
 * on touch screens and desktop
 * provides the following callbacks  
 *
 *  onDragStart(o)
 *  onDrag(o)
 *  onDragEnd(o)
 *
 *  provides an object with, x, y, v = Vector (Point) from 
 *  original point to current point
 *
 */
Ext.define('interactive.DraggableLayer', {

    extend: 'interactive.ClickableLayer',

    constructor: function (props) {
        this.callParent([props]);
        var layer = this;

        //normalize touch events to mouse events
        this.canvas.addEventListener('touchstart', function (event) {
            layer.onMouseDown(event.changedTouches ? event.changedTouches[0] : event);
        }, false);

        this.canvas.addEventListener('touchmove', function (event) {
            event.preventDefault();
            layer.onMouseMove(event.changedTouches ? event.changedTouches[0] : event);
            return false;
        }, false);

        this.canvas.addEventListener('touchend', function (event) {
            layer.onMouseUp(event.changedTouches ? event.changedTouches[0] : event);
        }, false);

        this.dragging = false;
        this.addedMouseEvents = false;

        //TODO: find a smart way to add and remove the -move and -up mouse events on mousedown
        //and remove them on mouseup
        this.canvas.addEventListener('mousedown', Ext.Function.bind(this.onMouseDown, this), false);
        this.canvas.addEventListener('mousemove', Ext.Function.bind(this.onMouseMove, this), false);
        this.canvas.addEventListener('mouseup', Ext.Function.bind(this.onMouseUp, this), false);
    },

    onMouseDown: function (event) {
        if (!this.dragging) {
            this.dragging = true;
            this.onStartDrag(event);
        }
    },

    onMouseMove: function (event) {
        if (this.dragging) {
            this.onDrag(event);
        }
    },

    onMouseUp: function (event) {
        if (this.dragging) {
            this.onEndDrag(event);
            this.dragging = false;
        }
    },

    onStartDrag: function (event) {
        this.handleEvent('startdrag', event);
    },

    onDrag: function (event) {
        this.handleEvent('drag', event);
    },

    onEndDrag: function (event) {
        //console.log("enddrag", event);
        this.handleEvent('enddrag', event);
    },

    handleEvent: function (evtName, event) {
        //this.callParent([evtName, event]);   //get coords realtive to the canvas
        var x = event.clientX - this.canvas.offsetLeft;
        var y = event.clientY - this.canvas.offsetTop;
        //detect if any shapes contain the event position
        this.items.forEach(function (shape) {
            if (shape.active && shape[evtName]) {
                //if (shape.containsPoint(x, y)) {
                //fire event
                shape[evtName](x - shape.x, y - shape.y);
                //}
            }
        });

    }



});
