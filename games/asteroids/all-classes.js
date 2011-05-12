/*
Copyright(c) 2011 Company Name
*/
/**
 * Use this as a base class to enable passing value objects 
 * to constructor functions of subclasses to initialize
 * object properties. A second object is used for default values
 */
Ext.define('oop.InitProps', {

    constructor: function (props) {
        if (props) {
            Ext.apply(this, props);
        }
    },
    //utility function to apply defaults to props
    //returns an array as this is only used as argument to callParent()
    applyProps: function (props, defaults) {
        return [Ext.applyIf(props, defaults || {})];
    }


});

Ext.define("eventbus.EventBus", {

    statics: {
        events: {},

        defineEvent: function (eventName) {
            //events is a hash of eventNames => array of subscribers for that event
            this.events[eventName] = [];
        },

        publish: function (eventName, payload) {
            if (this.events.hasOwnProperty(eventName)) {
                //call this event's subscribers' callback fns
                for (var i = 0; i < this.events[eventName].length; i++) {
                    var eventMap = this.events[eventName][i];
                    eventMap.callback.call(eventMap.subscriber, payload);
                }
            } //else... signal some error?
        },

        subscribe: function (eventName, callBack, subscriber) {
            if (this.events.hasOwnProperty(eventName)) {
                //TODO: dont add same subscriber and event combo twice ?
                this.events[eventName].push({
                    subscriber: subscriber,
                    callback: callBack
                });
            } //else... signal some error?
        }

    }
});

/*global soundManager */

Ext.define('soundeffects.SoundEffects', {
    statics: {
        sounds: {},
        //soundFiles = hash of soundName ==> path to mp3 file
        defineSounds: function (soundFiles) {
            var sfx = this;
            this.sounds = Ext.apply(this.sounds, soundFiles);
            window.soundManager.onready(function () {
                sfx.loadSounds();
            });
        },

        loadSounds: function () {
            console.log("loadSounds", this.sounds);
            for (var sound in this.sounds) {
                if (this.sounds.hasOwnProperty(sound)) {
                    window.soundManager.createSound({
                        id: sound,
                        url: this.sounds[sound]
                    });
                }
            }
        },

        play: function (sound, options) {
            if (this.sounds[sound]) {
                if (options) {
                    window.soundManager.play(sound, options);
                } else {
                    window.soundManager.play(sound);
                }
            }
        }

    }

});

Ext.define('controller.Keyboard', {
    extend: 'oop.InitProps',
    statics: {
        keys: {
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            32: 'space',
            19: 'pause',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        },

        getKey: function (e) {
            var evt = e || event;
            var key = this.keys[evt.keyCode];
            return key || '';
        }

    },
    context: window,
    keyUp: Ext.emptyFn,
    keyPress: Ext.emptyFn,
    constructor: function (props) {
        this.callParent([props]);
        document.onkeydown = Ext.Function.bind(this.onKeyPress, this);
        document.onkeyup = Ext.Function.bind(this.onKeyUp, this);
    },

    onKeyPress: function (e) {
        var key = this.self.getKey(e);
        this.keyPress.call(this.context, key);
    },

    onKeyUp: function (e) {
        var key = this.self.getKey(e);
        this.keyUp.call(this.context, key);
    }


});

Ext.define('interactive.Draggable', {

    onStartDrag: function (fn, ctx) {
        if (fn) {
            this.startdrag = Ext.Function.bind(fn, ctx);
        }
    },

    noStartDrag: function () {
        this.startdrag = null;
    },

    onDrag: function (fn, ctx) {
        if (fn) {
            this.drag = Ext.Function.bind(fn, ctx);
        }
    },

    noDrag: function () {
        this.drag = null;
    },

    onEndDrag: function (fn, ctx) {
        if (fn) {
            this.enddrag = Ext.Function.bind(fn, ctx);
        }
    },

    noEndDrag: function () {
        this.enddrag = null;
    }
});

/**
 * keeps track of a drag operation
 * start: Point
 * end: Point
 * dragTo(x, y);
 */
Ext.define('interactive.Drag', {
    extend: 'oop.InitProps',
    constructor: function (props) {
        this.callParent(this.applyProps(props, {}));
    },
    dragTo: function (x, y) {
        this.end.x = x;
        this.end.y = y;
    },
    getOffsetX: function () {
        return this.end.x - this.start.x;
    },
    getOffsetY: function () {
        return this.end.y - this.start.y;
    },
    distance: function () {
        var dx = this.getOffsetX();
        var dy = this.getOffsetY();
        return Math.sqrt(dx * dx + dy * dy);
    }

});

Ext.define('geometry.Point', {
    extend: 'oop.InitProps',
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            x: 0,
            y: 0
        })]);
    }
});

/*global geometry */
Ext.define('geometry.Line', {
    extend: 'geometry.Point',
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            start: new geometry.Point({
                x: 0,
                y: 0
            }),
            end: new geometry.Point({
                x: 100,
                y: 100
            })
        })]);
    },
    length: function () {
        var dx = this.end.x - this.start.x;
        var dy = this.end.y - this.start.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

});

/**
 * enables drawing of a shape to a canvas context
 * requires the class mixed into is a subclass of Path
 * and has a 'ctx' property which is a Canvas2D context
 */
Ext.define('drawable.Drawable', {

    initDrawable: function (context) {
        if (!context.ctx) {
            throw new Error("Sprite requires a context property");
        }
        this.ctx = context.ctx;
    },

    beforeDraw: function () {
        this.ctx.save();
        //apply shape transform to context
        this.ctx.translate(this.x, this.y);
        if (this.strokeStyle) {
            this.ctx.strokeStyle = this.strokeStyle;
        }
        if (this.fillStyle) {
            this.ctx.fillStyle = this.fillStyle;
        }
        if (this.rotation && this.rotation) {
            this.ctx.rotate(this.rotation);
        }
    },
    //default draw method assumes Path implementation
    draw: function () {
        this.beforeDraw();

        //draw closed path
        var startPoint = this.getPoint(0);
        var pathPoints = this.points.slice(1);
        this.ctx.beginPath();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        Ext.Array.forEach(pathPoints, function (pt, idx, arr) {
            this.ctx.lineTo(pt.x, pt.y);
        }, this);
        this.ctx.closePath();
        this.ctx.stroke();

        this.afterDraw();
    },

    afterDraw: function () {
        this.ctx.restore();
    }
});

Ext.namespace("canvasutils");
(function () {
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
                //of the local transformation matrix
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

    function _polygonsIntersect(ctx, shape1, shape2) {
        var intersect = false;
        var pts1 = shape1.points,
            pts2 = shape2.points;
        var pt, pt2;
        ctx.save();
        ctx.translate(shape1.x, shape1.y);
        //activate shape1 by drawing a path with its points
        ctx.beginPath();
        ctx.moveTo(pts1[0].x, pts1[0].y);
        for (var i = 1; i < pts1.length; i++) {
            pt = pts1[i];
            ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        //check if any of shape2's points intersect with it
        for (var j = 0; j < pts2.length; j++) {
            pt2 = pts2[j];
            if (isPointInPath(ctx, shape2.x + pt2.x, shape2.y + pt2.y, shape1.x, shape1.y)) {
                intersect = true;
                break;
            }
        }
        ctx.restore();
        return intersect;
    }

    function polygonsIntersect(ctx, shape1, shape2) {
        return _polygonsIntersect(ctx, shape1, shape2) || _polygonsIntersect(ctx, shape2, shape1);
    }

    //export the utility methods
    Ext.define('canvasutils.CanvasUtils', {
        statics: {
            isPointInPath: isPointInPath,
            polygonsIntersect: polygonsIntersect
        }
    });

})();

/**
 * requires that the host class has an items[] array
 * which will be managed by the methods:
 * add()
 * remove()
 * contains()
 * forEach()
 */
Ext.define('collection.Collection', {

    add: function (item) {
        if (Ext.isArray(item)) {
            Ext.Array.forEach(item, function (it) {
                Ext.Array.include(this.items, it);
            }, this);
        } else {
            Ext.Array.include(this.items, item);
        }
    },

    remove: function (item) {
        if (Ext.isArray(item)) {
            Ext.Array.forEach(item, function (it) {
                Ext.Array.remove(this.items, it);
            }, this);
        } else {
            Ext.Array.remove(this.items, item);
        }
    },

    contains: function (item) {
        return Ext.Array.contains(this.items, item);
    },

    forEach: function (fn, ctx) {
        Ext.Array.forEach(this.items, fn, ctx || this);
    },

    query: function (params) {
        return Ext.Array.filter(this.items, function (it) {
            var match = false;
            for (var p in params) {
                if (params.hasOwnProperty(p)) {
                    if (it[p] && it[p] === params[p]) {
                        match = true;
                    } else {
                        match = false;
                        break;
                    }
                }
            }
            return match;
        });
    },

    asArray: function () {
        return Ext.Array.clone(this.items);
    }
});

/*global canvasutils */
//requires this.ctx === Canvas 2D context
Ext.define('collision.Collision', {
    requires: ['canvasutils.CanvasUtils'],
    containsPoint: function (x, y) {
        var result;
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        //activate by drawing a path with points
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 0; i < this.points.length; i++) {
            var pt = this.points[i];
            this.ctx.lineTo(pt.x, pt.y);
        }
        this.ctx.closePath();
        result = canvasutils.CanvasUtils.isPointInPath(this.ctx, x, y, this.x, this.y);
        this.ctx.restore();
        return result;
    },

    intersects: function (otherShape) {
        return canvasutils.CanvasUtils.polygonsIntersect(this.ctx, this, otherShape);
    }

});

Ext.define('interactive.Clickable', {

    onClick: function (fn, ctx) {
        if (fn) {
            this.click = Ext.Function.bind(fn, ctx);
        }
    },

    noClick: function () {
        this.click = null;
    }
});

Ext.define('motion.Velocity', {
    //setVelocity must be called before move()
    //or an error will occur
    setVelocity: function (vx, vy, av) {
        this.vx = vx;
        this.vy = vy;
        //av is optional
        if (av !== undefined) {
            this.av = av;
        }
    },

    move: function () {
        this.x += this.vx;
        this.y += this.vy;
        //angular velocity
        if (this.av) {
            this.rotation += this.av;
        }
    }
});

/*global geometry */
Ext.define('geometry.Path', {

    extend: 'geometry.Point',

    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            points: []
        }));
    },

    addPoint: function (pt) {
        this.points.push(pt);
    },

    getPoint: function (idx) {
        return this.points[idx];
    },

    clearPoints: function () {
        this.points = [];
    },

    setPointsFromArray: function (array) {
        this.clearPoints();
        Ext.Array.forEach(array, function (p) {
            this.addPoint(new geometry.Point({
                x: p.x,
                y: p.y
            }));
        }, this);
    }

});

Ext.define('drawable.DrawableLine', {
    extend: 'geometry.Line',
    mixins: ['drawable.Drawable'],
    constructor: function (props) {
        this.callParent([props]);
        //this is a base drawable class -- set context (required property)
        this.initDrawable(this.context);
    },
    draw: function (ctx) {
        this.beforeDraw(ctx);
        this.ctx.beginPath();
        this.ctx.moveTo(this.start.x, this.start.y);
        this.ctx.lineTo(this.end.x, this.end.y);
        this.ctx.stroke();
        this.afterDraw(ctx);
    }
});

/*global canvasutils */
/**
 * Shape is a geometrical object
 * with more than one Point
 * a position, rotation, and scale
 */
Ext.define('geometry.Shape', {

    extend: 'geometry.Path',
    requires: ['canvasutils.CanvasUtils'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            rotation: 0,
            scale: 1
        })]);
    },

});

Ext.define('sprites.Sprite', {
    extend: 'geometry.Shape',
    mixins: ['motion.Velocity', 'drawable.Drawable', 'collision.Collision'],
    constructor: function (props) {
        this.callParent([props]);
        //this is a base drawable class -- set context (required property)
        this.initDrawable(this.context);
    }
});

/*global canvasutils canvasteroids*/
(function () {

    var TWO_PI = Math.PI * 2;
    var RND = function (max) {
        return Math.random() * max;
    };

    Ext.define('sprites.Rock', {
        extend: 'sprites.Sprite',
        requires: ['canvasutils.CanvasUtils'],
        constructor: function (props) {
            this.callParent([Ext.applyIf(props, {
                active: true,
                size: 3
            })]);
            //some properties must be derived
            this.init(props);
        },

        init: function (o) {

            var parent = o.parent;
            this.clearPoints();
            this.size = o.size; //3 -> big, 2 -> med, 1 -> small, 0 - dormant
            if (this.size === 3) {
                this.num_points = 16;
                this.radius = 60;
            } else if (this.size === 2) {
                this.num_points = 12;
                this.radius = 30;
            } else if (this.size === 1) {
                this.num_points = 6;
                this.radius = 8;
            } else {
                //log bad size found
            }
            var min_radius = this.radius * 0.7;
            var var_radius = this.radius * 0.3;
            this.ang_incr = TWO_PI / this.num_points;
            var r = 0;
            for (var p = 0; p < this.num_points; p++) {
                r += this.ang_incr;
                var radius = min_radius + RND(var_radius);
                this.addPoint({
                    x: radius * Math.cos(r),
                    y: radius * Math.sin(r)
                });
            }
            if (parent) {
                this.bearing = (parent.bearing + RND(TWO_PI)) / 2;
                this.vx = (parent.vx + o.speed) * Math.cos(this.bearing);
                this.vy = (parent.vy + o.speed) * Math.sin(this.bearing);
            } else {
                this.bearing = RND(TWO_PI);
                this.vx = o.speed * Math.cos(this.bearing);
                this.vy = o.speed * Math.sin(this.bearing);
            }

        },

        update: function () {
            this.move();
            this.checkWrap();
        },

        checkWrap: function () {
            var buffer = this.radius;
            var canvas_width = this.context.canvas_width;
            var canvas_height = this.context.canvas_height;

            if (this.x > canvas_width + buffer) {
                this.x = -buffer;
            } else if (this.x < -buffer) {
                this.x = canvas_width + buffer;
            }

            if (this.y > canvas_height + buffer) {
                this.y = -buffer;
            } else if (this.y < -buffer) {
                this.y = canvas_height + buffer;
            }
        }
    });

})();

Ext.define('sprites.ShipFragment', {
    extend: 'sprites.Sprite',
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            strokeStyle: '#FF0000'
        })]);
    },
    update: function () {
        this.move();
    },
    draw: function () {
        this.beforeDraw();
        this.ctx.save();
        this.ctx.translate(0, -this.length / 2);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, this.length);
        this.ctx.restore();
        this.ctx.stroke();
        this.afterDraw();
    }
});

/*global geometry */
Ext.define('geometry.Square', {

    extend: 'geometry.Shape',
    requires: ['geometry.Point'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            width: 100,
            height: 100
        })]);

        this.setPointsFromArray([{
            x: 0,
            y: 0
        },
        {
            x: this.width,
            y: 0
        },
        {
            x: this.width,
            y: this.height
        },
        {
            x: 0,
            y: this.height
        }]);
    }

});

/*global canvasutils */
Ext.define('drawable.DrawableSquare', {

    extend: 'geometry.Square',
    mixins: ['drawable.Drawable'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            fillStyle: "",
            strokeStyle: "#FF0000",
            context: null
        })]);
        //this is a base drawable class -- set context
        this.initDrawable(this.context);
    },
    //slightly optimized method for drawing a square, useful when drawing lots of points
    draw: function () {
        this.beforeDraw();
        if (this.fillStyle) {
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        if (this.strokeStyle) {
            this.ctx.strokeRect(0, 0, this.width, this.height);
        }
        this.afterDraw();
    }
});

/**
 * Components are similar in functionality to Sprites
 * but they are also Clickable and inherit from Square
 */
Ext.define('ui.Component', {
    extend: 'drawable.DrawableSquare',
    mixins: ['collision.Collision', 'interactive.Clickable'],
    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            active: true,
            clickable: true
        }));
    }
});

/*global interactive geometry*/
Ext.define('controller.TouchPad', {
    extend: 'ui.Component',
    requires: ['interactive.Drag', 'geometry.Point'],
    mixins: ['interactive.Draggable'],
    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            strokeStyle: "#FF0000",
            width: 200,
            height: 200,
            drags: {},
            //hash of identifier => Drag objects,
            multiTouch: true,
            singleTouchId: "",
            touching: false,
            touches: 0
        }));
        var self = this;
        //add listeners for dragging events provided by Draggable
        //create, update, or delete Drag objects in the drags hash
        //call the touch() callback added by onTouch() if it exists
        this.onStartDrag(function (x, y, id) {
            //do not create more than one drag object if multitouch disabled
            if (!self.multitouch) {
                if (self.touching) {
                    return;
                } else {
                    self.singleTouchId = id;
                }
            }
            self.drags[id] = new interactive.Drag({
                start: new geometry.Point({
                    x: x,
                    y: y
                }),
                end: new geometry.Point({
                    x: x,
                    y: y
                })
            });
            self.touches += 1;
            self.touching = true;
            if (self.touch) {
                self.touch("start", x, y, id, self.drags[id]);
            }
        });

        this.onDrag(function (x, y, id) {
            //ignore drags from additional touches if multitouch is disabled
            if (!self.multitouch && self.singleTouchId !== id) {
                return;
            }
            self.drags[id].dragTo(x, y);
            if (self.touch) {
                self.touch("drag", x, y, id, self.drags[id]);
            }
        });

        this.onEndDrag(function (x, y, id) {
            delete self.drags[id];

            if (!self.multitouch) {
                self.singleTouchId = "";
                self.touching = false;
            } else {
                self.touches -= 1;
                if (self.touches === 0) {
                    self.touching = false;
                }
            }

            if (self.touch) {
                self.touch("end", x, y, id);
            }
        });
    },
    //enable setting the touch() callback
    //-- can also be done in config
    onTouch: function (fn, ctx) {
        if (fn) {
            this.touch = Ext.Function.bind(fn, ctx);
        }
    }

});

/*global canvasutils */
Ext.define('ui.Button', {

    extend: 'ui.Component',
    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            text: 'Button'
        }));
    },

    draw: function () {

        this.beforeDraw();

        var m = this.ctx.measureText(this.text); //gets width only... height is font size
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "#00FF00";
        this.ctx.fillText(this.text, (this.width - m.width) / 2, (this.height) / 2);

        //draw box - this remains as the active path after the function returns
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.width, this.height);
        this.ctx.stroke();

        this.afterDraw();
    }
});

Ext.define('sprites.Point', {
    extend: 'drawable.DrawableSquare',
    mixins: ['motion.Velocity', 'collision.Collision'],
    constructor: function (props) {
        this.callParent([props]);
    }

});

/*global eventbus */
Ext.define('sprites.Bullet', {
    extend: 'sprites.Point',
    requires: ['eventbus.EventBus'],
    constructor: function (props) {
        this.callParent([Ext.applyIf(props, {
            width: 2,
            height: 2,
            dx: 0,
            dy: 0,
            vx: 0,
            vy: 0
        })]);
    },

    update: function () {
        var plane_width = this.context.width;
        var plane_height = this.context.height;
        this.move();
        this.dx += Math.abs(this.vx);
        this.dy += Math.abs(this.vy);

        //expire the bullet after a maximum distance
        if (this.dx > plane_width * 0.6 || this.dy > plane_height * 0.6) {
            eventbus.EventBus.publish('bulletExpired', this);
            return;
        }
        //do wrapping
        if (this.x < 0) {
            this.x += plane_width;
        } else if (this.x > plane_width) {
            this.x -= plane_width;
        }
        if (this.y < 0) {
            this.y += plane_height;
        } else if (this.y > plane_height) {
            this.y -= plane_height;
        }
    }

});

/*global canvasutils canvasteroids*/
(function () {
    var TWO_PI = Math.PI * 2;
    var RND = function (max) {
            return Math.random() * max;
        };
    var FPS = 30;
    var LEVEL = 1;
    var TIMER;
    var MAX_BULLETS = 25;
    var MAX_SPEED = 15;

    Ext.define('sprites.Ship', {
        extend: 'sprites.Sprite',
        requires: ['sprites.Bullet'],
        constructor: function (props) {
            this.callParent([Ext.applyIf(props, {
                active: true
            })]);

            this.height = 25;
            this.width = 15;
            this.baseAngle = Math.atan2(this.height, this.width / 2);
            this.setPointsFromArray([Ext.create('geometry.Point', {
                x: -this.width / 2,
                y: this.height / 2
            }), Ext.create('geometry.Point', {
                x: 0,
                y: -this.height / 2
            }), Ext.create('geometry.Point', {
                x: this.width / 2,
                y: this.height / 2
            })]);

        },

        init: function () {
            this.x = this.context.canvas_width / 2;
            this.y = this.context.canvas_height / 2;
            this.turn_speed = TWO_PI / 60;
            this.rotation = 0;
            this.rv = 0;
            this.setVelocity(0, 0);
            this.acc = 0;
            this.mass = 5;
            this.force = 0;
            this.friction = 0.998;
            this.thrust = false;
        },

        reset: function () {
            this.init();
        },

        rotate: function (dir) {
            this.rv = dir * this.turn_speed;
        },

        turnRight: function () {
            this.rotate(1);
        },

        turnLeft: function () {
            this.rotate(-1);
        },

        stopTurningRight: function () {
            //only stop turning if currently turning right
            //so as not to break turning left
            if (this.rv > 0) {
                this.rotate(0);
            }
        },

        stopTurningLeft: function () {
            if (this.rv < 0) {
                this.rotate(0);
            }
        },

        stopTurning: function () {
            this.rotate(0);
        },

        startThrust: function () {
            this.thrust = true;
            this.force = -1.1; //-y direction
        },

        setThrust: function (f) {
            this.thrust = true;
            this.force = f;
        },

        stopThrust: function () {
            this.thrust = false;
            this.force = 0;
        },

        update: function () {
            var accel, orientation, ax, ay;
            var max_vel = 5;
            this.rotation = this.rotation + this.rv;
            var canvas_width = this.context.canvas_width;
            var canvas_height = this.context.canvas_height;

            if (this.thrust) {
                //force is applied in direction of ships orientation
                //F = ma
                //a = F/m
                accel = this.force / this.mass;
                orientation = this.rotation + Math.PI / 2;
                ax = accel * Math.cos(orientation);
                ay = accel * Math.sin(orientation);
                //apply acceleration to velocity
                this.vx += ax;
                this.vy += ay;
            }
            //wrapping
            if (this.x < 0) {
                this.x += canvas_width;
            } else if (this.x > canvas_width) {
                this.x -= canvas_width;
            }
            if (this.y < 0) {
                this.y += canvas_height;
            } else if (this.y > canvas_height) {
                this.y -= canvas_height;
            }
            //cap speed
            if (this.vx > MAX_SPEED) {
                this.vx = MAX_SPEED;
            } else if (this.vx < -MAX_SPEED) {
                this.vx = -MAX_SPEED;
            }
            if (this.vy > MAX_SPEED) {
                this.vy = MAX_SPEED;
            } else if (this.vy < -MAX_SPEED) {
                this.vy = -MAX_SPEED;
            }
            this.move();
            if (this.exploding) {
                this.animateExplosion();
            }
        }

    });

}());

/**
 * Plane is a 2D surface
 * if 'wrap' is true, shapes will 
 * wrap their positions if they 
 * move out of the boundaries of the plane
 */
Ext.define('geometry.Plane', {
    extend: 'geometry.Square',
    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            wrap: false
        }));
    }
});

Ext.define('canvasutils.Context2D', {
    //default config
    extend: 'geometry.Plane',
    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            canvasId: 'canvas',
            bg: '#000000',
            strokeStyle: '#00FF00',
            fillStyle: '#FF0000',
            fullscreen: true
        }));
        this.canvas = document.getElementById(this.canvasId);

        this.ctx = this.canvas.getContext('2d');

        this.resize();
        this.reset();
    },
    /**
     * resize the context to be same as the canvas element
     * or if fullscreen , resize both canvas and context 
     * to size of document
     */
    resize: function () {
        if (this.fullscreen) {
            this.canvas_width = document.documentElement.clientWidth;
            this.canvas_height = document.documentElement.clientHeight;
        }
        this.width = this.canvas_width;
        this.height = this.canvas_height;
        console.log("resized to ", this.width, this.height);
        this.canvas.setAttribute('width', this.canvas_width);
        this.canvas.setAttribute('height', this.canvas_height);
    },

    reset: function () {
        this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.font = "24px Verdana,Arial,sans-serif";
    },

    applyStroke: function (col) {
        this.ctx.strokeStyle = col;
    },

    applyFill: function (col) {
        this.ctx.fillStyle = col;
    }

});

Ext.define('drawable.Layer', {

    extend: 'canvasutils.Context2D',

    mixins: ['collection.Collection'],

    constructor: function (props) {
        this.callParent(this.applyProps(props, {
            items: []
        }));
    },

    update: function () {
        this.forEach(function (shape) {
            if (shape.active === false) {
                return;
            }
            if (shape.update) {
                shape.update();
            }
        });
    },

    render: function () {
        var shape;
        for (var i = 0; i < this.items.length; i++) {
            shape = this.items[i];
            if (shape.active === false) {
                continue;
            } else {
                shape.draw();
            }
        }
    }


});

Ext.define('interactive.ClickableLayer', {
    extend: 'drawable.Layer',
    constructor: function (props) {
        this.callParent([props]);
        //assume W3C event model
        //does not support IE < 9 since it has no canvas anyways... use Chrome Frame
        var layer = this;
        var surface = this.canvas;

        //this.canvas.addEventListener('mousedown', Ext.Function.bind(this.onMouseDown, this), false);
        //this.canvas.addEventListener('mousemove', Ext.Function.bind(this.onMouseMove, this), false);
        //this.canvas.addEventListener('mouseup', Ext.Function.bind(this.onMouseUp, this), false);
        this.canvas.addEventListener('click', Ext.Function.bind(this.onClick, this), false);

        this.canvas.addEventListener('click', function (event) {
            layer.handleEvent('click', event);
        }, false);
    },

/*onMouseDown: function (event) {
        console.log('mousedown', event);
        this.handleEvent('mousedown', event);
    },

    onMouseMove: function (event) {
        console.log('mousemove', event);
        this.handleEvent('mousemove', event);
    },

    onMouseUp: function (event) {
        console.log('mouseup', event);
        this.handleEvent('mouseup', event);
    },*/

    onClick: function (event) {
        console.log('click', event);
        this.handleEvent('click', event);
    },

    handleEvent: function (evtName, evtObject) {
        //get coords realtive to the canvas
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

/*global interactive */
/**
 * DraggableLayer
 * supports dragging of items with Draggable mixin
 * on touch screens and desktop
 * provides the following callbacks  
 *
 *  _dragStart(o)
 *  _drag(o)
 *  _dragEnd(o)
 *
 *  provides an object with, x, y, v = Vector (Point) from 
 *  original point to current point
 *
 */
Ext.define('interactive.DraggableLayer', {

    extend: 'interactive.ClickableLayer',
    mixins: ['interactive.Draggable'],
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
            layer._mousedown(normalizeTouchEvent(event));
        }, false);

        this.canvas.addEventListener('touchmove', function (event) {
            event.preventDefault();
            layer._mousemove(normalizeTouchEvent(event));
        }, false);

        this.canvas.addEventListener('touchend', function (event) {
            layer._mouseup(normalizeTouchEvent(event));
        }, false);

        this.canvas.addEventListener('mousedown', Ext.Function.bind(this._mousedown, this), false);
    },

    _mousedown: function (event) {
        if (event.type === "touchstart") {
            this.canvas.removeEventListener('mousedown', Ext.Function.bind(this._mousedown, this), false);
        }
        if (event.type === "mousedown") {
            this.dragging = true;
            this.canvas.addEventListener('mousemove', Ext.Function.bind(this._mousemove, this), false);
            this.canvas.addEventListener('mouseup', Ext.Function.bind(this._mouseup, this), false);
        }
        this._startdrag(event);
    },

    _mousemove: function (event) {
        //touch events move always trigger drag
        if (event.type === "touchmove") {
            this._drag(event);
            //check if dragging === true for mousemove events as they fire on hover also
        } else if (event.type === "mousemove" && this.dragging) {
            this._drag(event);
        }
    },

    _mouseup: function (event) {
        if (event.type === "touchend") {
            this._enddrag(event);
        } else if (event.type === "mouseup" && this.dragging) {
            this._enddrag(event);
            this.dragging = false;
            this.canvas.removeEventListener('mousemove', Ext.Function.bind(this._mousemove, this), false);
            this.canvas.removeEventListener('mouseup', Ext.Function.bind(this._mouseup, this), false);
        }
    },

    _startdrag: function (event) {
        this.handleEvent('startdrag', event);
    },

    _drag: function (event) {
        this.handleEvent('drag', event);
    },

    _enddrag: function (event) {
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
                    shape[evtName](x - shape.x, y - shape.y, event.identifier || 'single');
                }
            }
        });
        //also fire drag event on self
        if (this[evtName]) {
            this[evtName](x - this.x, y - this.y);
        }
    }

});

/*global canvasteroids controller sprites geometry renderer eventbus drawable ui interactive soundeffects */
(function () {
    var TWO_PI = Math.PI * 2;
    var RND = function (max) {
            return Math.random() * max;
        };
    var FPS = 30;
    var LEVEL = 1;
    var TIMER;
    var MAX_BULLETS = 25;
    var MAX_SPEED = 15;
    //initialize canvas and clear screen
    Ext.define('Asteroids', {

        extend: 'oop.InitProps',

        requires: ['eventbus.EventBus', 'controller.TouchPad', 'drawable.DrawableLine', 'soundeffects.SoundEffects', 'sprites.Rock', 'sprites.Ship', 'sprites.ShipFragment', 'sprites.Bullet', 'drawable.Layer', 'controller.Keyboard', 'ui.Button', 'interactive.DraggableLayer'],

        constructor: function (props) {
            this.callParent([props]);
            this.rocks = [];
            this.bullets = [];
            var self = this;
            //handle window resizes
            window.onresize = function () {
                var lastTime;
                if (lastTime) {
                    clearInterval(lastTime);
                }
                lastTime = setTimeout(function () {
                    self.state('resize');
                }, 200);
            };

            this.gameLayer = new interactive.DraggableLayer({
                x: 0,
                y: 0,
                fullscreen: true,
                canvasId: this.canvasId,
                stroke: this.stroke
            });

            this.keyboard = new controller.Keyboard({
                context: this,
                keyPress: this.onKeyPress,
                keyUp: this.onKeyUp
            });

            this.touchPad = new controller.TouchPad({
                context: this.gameLayer,
                x: 0,
                y: 0,
                width: this.gameLayer.canvas_width,
                height: this.gameLayer.canvas_height,
                touch: Ext.Function.bind(this.onTouch, this),
                multiTouch: false
            });


            this.gameLayer.add(this.touchPad);

            this.ship = new sprites.Ship({
                active: false,
                context: this.gameLayer,
                strokeStyle: "#FF0000"
            });
            this.gameLayer.add(this.ship);

            eventbus.EventBus.defineEvent('bulletExpired');
            eventbus.EventBus.subscribe('bulletExpired', this.onBulletExpired, this);

            this.startButton = new ui.Button({
                text: "Play",
                width: 120,
                height: 40,
                x: this.gameLayer.width / 2 - 100,
                y: this.gameLayer.height / 2 - 20,
                active: false,
                context: this.gameLayer
            });
            this.gameLayer.add(this.startButton);

            soundeffects.SoundEffects.defineSounds({
                'laser': '../../lib/sounds/laser.mp3',
                'rock_explode': '../../lib/sounds/explode.mp3',
                'thrust': '../../lib/sounds/thrust.mp3',
                'boom': '../../lib/sounds/boom.mp3',
                'asteroids_loop': '../../lib/sounds/asteroids_loop.mp3'
            });

            this.sfx = soundeffects.SoundEffects;
        },

        onTouch: function (evt, x, y, id, drag) {
            //a slow drag changes thrust
            //a click or tap fires
            var self = this;
            if (evt === "start") {
                //set timer to start thrust
                this.thrustTimeout = setTimeout(function () {
                    self.thrustVectorLine = new drawable.DrawableLine({
                        start: drag.start,
                        end: drag.end,
                        context: self.gameLayer
                    });
                    self.gameLayer.add(self.thrustVectorLine);
                    self.thrustVector = drag;
                }, 250);
            }

            if (evt === "drag") {
                this.state("drag");
            }

            if (evt === "end") {

                if (this.thrustVectorLine) {
                    this.gameLayer.remove(this.thrustVectorLine);
                    this.thrustVectorLine = null;
                } else if (this.thrustTimeout) {
                    //cancel thrust action if it hasn't happened yet
                    clearTimeout(this.thrustTimeout);
                    //fire bullet since this was a click or tap event
                    this.state("click");
                }
                this.thrustVector = null;
                this.thrustTimeout = null;
                this.state("dragend");
            }
        },

        startLevel: function () {
            this.makeRocks();
            this.changeState(this.PLAY);
        },

        changeState: function (newState) {
            if (this.state) {
                this.state('exit');
            }
            this.state = newState;
            this.state('enter');
        },

        stopTimer: function () {
            if (TIMER) {
                clearInterval(TIMER);
            }
            TIMER = null;
        },

        coastIsClear: function () {
            var rx, ry, rock, r, safeSpace = 100;
            for (r = 0; r < this.rocks.length; r++) {
                rock = this.rocks[r];
                if (!rock.active) {
                    continue;
                }
                rx = rock.x;
                ry = rock.y;
                if (rx > this.ship.x - safeSpace && rx < this.ship.x + safeSpace && ry > this.ship.y - safeSpace && ry < this.ship.y + safeSpace) {
                    return false;
                }
            }
            return true;
        },

        addRock: function (rock) {
            this.rocks.push(rock);
            this.gameLayer.add(rock);
        },

        removeRock: function (rock) {
            Ext.Array.remove(this.rocks, rock);
            this.gameLayer.remove(rock);
        },

        removeAllRocks: function () {
            Ext.Array.forEach(this.rocks, function (rock) {
                this.removeRock(rock);
            }, this);
        },

        makeRocks: function () {

            var rock, r, num_rocks = Math.round(LEVEL * 0.25 * 24);
            this.removeAllRocks();
            for (r = 0; r < num_rocks; r++) {

                rock = new sprites.Rock({
                    strokeStyle: '#00FF00',
                    context: this.gameLayer,
                    x: RND(this.gameLayer.canvas_width),
                    y: RND(this.gameLayer.canvas_height),
                    size: 3,
                    speed: 1
                });

                //do not clobber ship
                if (this.ship && this.state === this.START_LEVEL && rock.intersects(this.ship)) {
                    num_rocks++;
                    continue;
                }

                this.addRock(rock);
            }
        },

        start: function () {
            this.changeState(this.START_GAME);
        },

        onBulletExpired: function (bullet) {
            this.removeBullet(bullet);
        },

        addBullet: function (bullet) {
            this.bullets.push(bullet);
            this.gameLayer.add(bullet);
        },

        removeBullet: function (bullet) {
            Ext.Array.remove(this.bullets, bullet);
            this.gameLayer.remove(bullet);
        },

        removeAllBullets: function () {
            Ext.Array.forEach(this.bullets, function (bullet) {
                this.removeBullet(bullet);
            }, this);
        },

        fireBullet: function () {
            var bulletSpeed = 8;
            //bullet should initially be at the tip of the space ship
            //moving away (up) 
            var r = this.ship.rotation - Math.PI / 2;
            var h = this.ship.height / 2;
            this.addBullet(new sprites.Bullet({
                dx: 0,
                dy: 0,
                x: this.ship.x + h * Math.cos(r),
                y: this.ship.y + h * Math.sin(r),
                vx: this.ship.vx + bulletSpeed * Math.cos(r),
                vy: this.ship.vy + bulletSpeed * Math.sin(r),
                context: this.gameLayer
            }));
            this.sfx.play('laser');
        },

        bulletHitRock: function (rock) {
            var bullet, ctx, i;
            ctx = this.gameLayer.ctx;
            for (i = 0; i < this.bullets.length; i++) {
                bullet = this.bullets[i];
                //this function is called while the current transformation matrix
                //has a translation applied to it, so we need to use the polyfill
                if (rock.containsPoint(bullet.x, bullet.y)) {
                    this.removeBullet(bullet);
                    return true;
                }
            }
            return false;
        },

        explodeRock: function (rock) {
            var newRock, rock_conf, i;
            //only create new rocks if it is not the smallest size
            if (rock.size > 1) {
                for (i = 0; i < 3; i++) {
                    this.addRock(new sprites.Rock({
                        context: this.gameLayer,
                        x: rock.x,
                        y: rock.y,
                        size: rock.size - 1,
                        speed: RND(3),
                        parent: rock
                    }));
                }
            }
            this.removeRock(rock);
            this.sfx.play('rock_explode');
        },

        hitRock: function (ship, rock) {
            //check if ship is out of range first
            //before doing more expensive detection
            var range = ship.height + rock.radius; //minimum proximity for collision to occur
            if (Math.abs(ship.x - rock.x) > range || Math.abs(ship.y - rock.y) > range) {
                return false;
            } else {
                return ship.intersects(rock);
            }
        },

        rocksLeft: function () {
            return this.rocks.length > 0;
        },

        bulletsLeft: function () {
            return this.bullets.length > 0;
        },

        startTimer: function () {
            var me = this;
            //don't stop if already started
            if (!TIMER) {
                TIMER = setInterval(function () {
                    me.state('tick');
                }, 1000 / FPS);
            }
        },

        resize: function () {

            //recenter button
            this.startButton.x = this.gameLayer.canvas_width / 2 - this.startButton.width / 2;
            this.startButton.y = this.gameLayer.canvas_height / 2 - this.startButton.height / 2;
            this.gameLayer.resize();

            //resize touchPad
            this.touchPad.width = this.gameLayer.canvas_width;
            this.touchPad.height = this.gameLayer.canvas_height;

        },

        reset: function () {
            this.gameLayer.reset();
        },

        explodeShip: function (ship) {

            this.ship.active = false;
            this.shipFragments = [new sprites.ShipFragment({
                x: ship.x + ship.points[0].x,
                y: ship.y + ship.points[0].y,
                av: RND(0.05) - RND(0.025),
                rotation: Math.atan2(ship.points[1].y, ship.points[1].x),
                length: Math.sqrt((ship.width / 2) * (ship.width / 2) + ship.height * ship.height),
                vx: RND(2) - Math.random(),
                vy: RND(2) - Math.random(),
                context: this.gameLayer
            }), new sprites.ShipFragment({
                x: ship.x + ship.points[1].x,
                y: ship.y + ship.points[1].y,
                av: RND(0.05) - RND(0.025),
                rotation: Math.atan2(ship.points[2].y, ship.points[2].x),
                length: Math.sqrt((ship.width / 2) * (ship.width / 2) + ship.height * ship.height),
                vx: RND(2) - Math.random(),
                vy: RND(2) - Math.random(),
                context: this.gameLayer
            }), new sprites.ShipFragment({
                x: ship.x + ship.points[0].x,
                y: ship.y + ship.points[0].y,
                av: RND(0.05) - RND(0.025),
                rotation: 0,
                length: ship.width,
                vx: RND(2) - Math.random(),
                vy: RND(2) - Math.random(),
                context: this.gameLayer
            })];
            this.gameLayer.add(this.shipFragments);
            this.sfx.play('boom');
        },
        handleInput: function (event) {
            var force;
            switch (event) {

            case 'right_keypress':
                this.ship.turnRight();
                break;

            case 'left_keypress':
                this.ship.turnLeft();
                break;

            case 'left_keyup':
                this.ship.stopTurningLeft();
                break;

            case 'right_keyup':
                this.ship.stopTurningRight();
                break;

            case 'up_keypress':
                this.ship.startThrust();
                this.sfx.play('thrust');
                break;

            case 'up_keyup':
                this.ship.stopThrust();
                break;

            case 'spacebar':
                this.fireBullet();
                break;

            case 'click':
                this.fireBullet();
                break;

            case 'drag':
                //set rotational velocity from size of drag
                if (this.thrustVector) {
                    force = Math.abs(this.thrustVector.getOffsetY() / 500);
                    if (force < 1) {
                        force = force + 1;
                    }
                    if (force > 1.1) {
                        force = 1.1;
                    }
                    this.ship.setThrust(-1 * force);
                    //this.ship.turn_speed = (this.thrustVector.distance() / 100) * TWO_PI / 60;
                    if (this.thrustVector.start.x < this.thrustVector.end.x) {
                        this.ship.turnRight();
                    } else if (this.thrustVector.start.x > this.thrustVector.end.x) {
                        this.ship.turnLeft();
                    }
                }
                break;

            case 'dragend':
                this.ship.stopTurning();
                this.ship.stopThrust();
                break;


            case 'resize':
                this.resize();
                this.reset();
                break;

            default:

            }
        },

        onKeyPress: function (key) {

            switch (key) {
            case 'left':
                this.state('left_keypress');
                break;

            case 'right':
                this.state('right_keypress');
                break;

            case 'up':
                this.state('up_keypress');
                break;

            case 'space':
                this.state('spacebar');
                break;

            default:
                // code
            }
        },

        onKeyUp: function (key) {

            switch (key) {
            case 'left':
                this.state('left_keyup');
                break;

            case 'right':
                this.state('right_keyup');
                break;

            case 'up':
                this.state('up_keyup');
                break;

            default:
                // code
            }
        },

        START_GAME: function (msg) {
            var me = this;

            this.startButton.active = true;
            this.startButton.onClick(function () {
                this.changeState(this.START_LIFE);
            }, this);

            switch (msg) {

            case 'enter':
                this.makeRocks();
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.gameLayer.update();
                this.gameLayer.render();
                break;

            case 'exit':
                break;

            default:
                this.handleInput(msg);
            }
        },


        END_LEVEL: function (msg) {
            var me = this;
            switch (msg) {

            case 'enter':
                setTimeout(function () {
                    me.startLevel();
                }, 5000);
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.gameLayer.update();
                this.gameLayer.render();
                break;

            case 'exit':
                break;

            default:
                this.handleInput(msg);
            }
        },


        START_LIFE: function (msg) {

            switch (msg) {

            case 'enter':
                this.startButton.active = false;
                this.ship.init();
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.gameLayer.update();
                this.gameLayer.render();
                if (this.coastIsClear()) {
                    this.changeState(this.PLAY);
                }
                break;

            case 'resize':
                this.resize();
                this.reset();
                break;

            case 'exit':
                break;

            default:
            }
        },

        PLAY: function (msg) {
            var r;
            switch (msg) {

            case 'enter':
                this.ship.active = true;
                this.startTimer();
                break;

            case 'tick':
                this.reset();
                this.gameLayer.update();
                for (r = 0; r < this.rocks.length; r++) {
                    var rock = this.rocks[r];
                    //check for collisions
                    if (this.hitRock(this.ship, rock)) {
                        this.explodeShip(this.ship);
                        this.changeState(this.END_LIFE);
                    }
                    if (this.bulletHitRock(rock)) {
                        this.explodeRock(rock);
                    }
                }
                this.gameLayer.render();

                if (!this.rocksLeft()) {
                    this.changeState(this.END_LEVEL);
                }
                break;

            case 'exit':

                this.stopTimer();
                break;

            default:
                this.handleInput(msg);
            }

        },

        END_LIFE: function (msg) {
            var me = this;
            switch (msg) {

            case 'enter':
                this.startTimer();
                //set time-limit on this state
                setTimeout(function () {
                    me.changeState(me.START_LIFE);
                }, 5000);
                break;

            case 'tick':
                this.reset();
                //call update on all shapes in the plane
                this.gameLayer.update();
                this.gameLayer.render();
                break;

            case 'resize':

                this.resize();
                this.reset();
                break;

            case 'exit':
                //remove ship fragments
                this.gameLayer.remove(this.shipFragments);
                break;

            default:
            }
        }

    });

}());



