class Boundary {
    xy = [];
    wh = [];

    constructor(x, y, w, h) {
        this.xy[0] = x;
        this.xy[1] = y;
        this.wh[0] = w;
        this.wh[1] = h;

        this.EPSILON = 0.000001;
    }

    getMinX() { return this.getMinOfDim(0); }
    getMinY() { return this.getMinOfDim(1); }
    getMaxX() { return this.getMaxOfDim(0); }
    getMaxY() { return this.getMaxOfDim(1); }

    getMinOfDim(dimension) {
        return this.xy[dimension];
    }
    getMaxOfDim(dimension) {
        return this.xy[dimension] + this.wh[dimension];
    }

    contains(point) {
        var px = point.coordinates[0];
        var py = point.coordinates[1];
        var bx = this.xy[0];
        var by = this.xy[1];
        var w = this.wh[0];
        var h = this.wh[1];
        return px >= bx && px < bx + w && py >= by && py < by + h;

        /*
        return (point.getX() - this.getMaxX()) < this.EPSILON
            && -1 * (point.getX() - this.getMinX()) < this.EPSILON
            && (point.getY() - this.getMaxY()) < this.EPSILON
            && -1 * (point.getY() - this.getMinY()) < this.EPSILON
            ;
        */
    }
}
