class Point {
    coordinates = [];
    constructor(x, y, id) {
        this.coordinates[0] = x;
        this.coordinates[1] = y;
        this.id = id;
    }

    getX() { return this.coordinates[0]; }
    getY() { return this.coordinates[1]; }
    getId() { return this.id; }

    compareTo(p) {
        return this.coordinates[0] === p.coordinates[0] && this.coordinates[1] === p.coordinates[1];
    }

    print() {
        document.write(this.coordinates[0] + " " + this.coordinates[1]);
    }

    toString() {
        return this.id + " [" + this.coordinates[0] + "," + this.coordinates[1] + "]";
    }
}
