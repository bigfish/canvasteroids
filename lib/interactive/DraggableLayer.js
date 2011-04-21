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
        this.dragging = false;

        function normalizeTouchEvent(event) {
            var singleTouchEvent;
            //normalize multitouch
            //there should only be a single changedTouch - which fired the event
            if (event.changedTouches) {
                singleTouchEvent = event.changedTouches[0];
                singleTouchEvent.type = event.type;
            }
            return singleTouchEvent || event;
        }
        //normalize touch events to mouse events
        this.canvas.addEventListener('touchstart', function (event) {
            layer.onMouseDown(normalizeTouchEvent(event));
        }, false);

        this.canvas.addEventListener('touchmove', function (event) {
            event.preventDefault();
            layer.onMouseMove(normalizeTouchEvent(event));
        }, false);

        this.canvas.addEventListener('touchend', function (event) {
            layer.onMouseUp(normalizeTouchEvent(event));
        }, false);

        this.canvas.addEventListener('mousedown', Ext.Function.bind(this.onMouseDown, this), false);
    },

    onMouseDown: function (event) {
        if (event.type === "touchstart") {
            this.canvas.removeEventListener('mousedown', Ext.Function.bind(this.onMouseDown, this), false);
        }
        if (event.type === "mousedown") {
            this.dragging = true;
            this.canvas.addEventListener('mousemove', Ext.Function.bind(this.onMouseMove, this), false);
            this.canvas.addEventListener('mouseup', Ext.Function.bind(this.onMouseUp, this), false);
        }
        this.onStartDrag(event);
    },

    onMouseMove: function (event) {
        //touch events move always trigger drag
        if (event.type === "touchmove") {
            this.onDrag(event);
            //check if dragging === true for mousemove events as they fire on hover also
        } else if (event.type === "mousemove" && this.dragging) {
            this.onDrag(event);
        }
    },

    onMouseUp: function (event) {
        if (event.type === "touchend") {
            this.onEndDrag(event);
        } else if (event.type === "mouseup" && this.dragging) {
            this.onEndDrag(event);
            this.dragging = false;
            this.canvas.removeEventListener('mousemove', Ext.Function.bind(this.onMouseMove, this), false);
            this.canvas.removeEventListener('mouseup', Ext.Function.bind(this.onMouseUp, this), false);
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
                if (shape.containsPoint(x, y)) {
                    //fire event
                    shape[evtName](x - shape.x, y - shape.y);
                }
            }
        });

    }

});
