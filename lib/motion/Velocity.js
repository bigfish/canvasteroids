Ext.define('motion.Velocity', {
    //setVelocity must be called before move()
    //or an error will occur
    setVelocity: function (vx, vy) {
        this.vx = vx;
        this.vy = vy;
    },
    move: function () {
        this.x += this.vx;
        this.y += this.vy;
    }
});
