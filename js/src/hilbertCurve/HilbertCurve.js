class Point {
    coordinates = [];
    constructor(coordinates) {
        this.coordinates = coordinates;
    }
    toString(){
        let toReturn = "[";
        for (let i = 0; i < this.coordinates.length; i++) {

            toReturn = toReturn.concat(this.coordinates[i]);
            if (i + 1 !== this.coordinates.length) {
                toReturn = toReturn.concat(", ")
            }
        }
        toReturn = toReturn.concat("]");
        return toReturn;
    }
    equals(p) {
        for (let i = 0; i < this.coordinates.length; i++) {
            if (this.coordinates[i] !== p.coordinates[i]) {
                return false;
            }
        }
        return true;
    }
}

class Boundary {
    dimensionMins = [];
    dimensionMaxs = [];

    constructor(dimensionMins, dimensionMaxs) {
        this.dimensionMaxs = dimensionMaxs;
        this.dimensionMins = dimensionMins;

    }

    contains(point) {
        for (let i = 0; i < point.coordinates.length; i++) {
            if (point.coordinates[i] <= this.dimensionMins[i] || point.coordinates[i] > this.dimensionMaxs[i])
                return false;
        }
        return true;
    }

    toString() {
        let toReturn = "[";
        for (let i = 0; i < this.dimensionMins.length; i++) {

            toReturn = toReturn.concat(this.dimensionMins[i]);
            if (i + 1 !== this.dimensionMins.length) {
                toReturn = toReturn.concat(", ")
            }
        }
        toReturn = toReturn.concat("]  [");
        for (let i = 0; i < this.dimensionMaxs.length; i++) {

            toReturn = toReturn.concat(this.dimensionMaxs[i]);
            if (i + 1 !== this.dimensionMaxs.length) {
                toReturn = toReturn.concat(", ")
            }
        }
        toReturn = toReturn.concat("]");
        return toReturn;
    }
}














let p = new Point([0, 0]);
document.writeln("Hello world");
document.writeln(p);
