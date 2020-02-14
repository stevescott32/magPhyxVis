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



class KTree {
    depth;
    boundary;
    children = [];
    capacity;
    traverseList = [];
    points = [];
    isDivided = false;
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.depth = 0;
    }

    insertPoint(point) {
        if (this.boundary.contains(point)) {
            if (this.isDivided) {
                for (let i = 0; i < this.children.length; i++) {
                    this.children[i].insertPoint(point);
                }
            }
            else {
                this.points.push(point);
                if (this.points.length > this.capacity) {
                    this.subdivide();
                    for (let i = 0; i < this.points.length; i++) {
                        for (let j = 0; j < this.children.length; j++) {
                            if (this.children[j].insertPoint(this.points[i])) {
                                break;
                            }
                        }
                    }
                    this.points = [];
                }
            }
            return true;
        }
        return false;
    }

    subdivide() {
        for (let i = 0; i < 2 ** this.boundary.dimensionMins.length; i++) {
            let map = this.iterate(this.boundary.dimensionMins.length, i);
            let mins = [];
            let maxs = [];
            for (let j = 0; j < map.length; j++) {
                if (map[j] === "0") {
                    mins.push(this.boundary.dimensionMins[j]);
                    maxs.push((this.boundary.dimensionMaxs[j] + this.boundary.dimensionMins[j]) / 2);
                }
                else if (map[j] === "1") {
                    mins.push((this.boundary.dimensionMaxs[j] + this.boundary.dimensionMins[j]) / 2);
                    maxs.push(this.boundary.dimensionMaxs[j]);
                }
                else {
                    document.writeln("failed <br>");
                }
            }
            this.children.push(new KTree(new Boundary(mins, maxs), this.capacity));
        }
        this.isDivided = true;


    }

    iterate(dimensions, index) {
        let arr = [];
        let binary = (index >>> 0).toString(2);
        for (let i = 0; i < binary.length; i++) {
            arr.push(binary[i]);
        }
        arr = this.fillOutArray(arr, dimensions);
        return arr;
    }

    fillOutArray(arr, dimensions) {
        while (arr.length < dimensions) {
            arr.splice(0, 0, "0");
        }
        return arr;
    }

    getBoundaries() {
        console.log('Getting boundaries');
        if (this.isDivided) {
            let combined = [];
            for (let i = 0; i < this.children.length; i++) {
                let childBoundaries = this.children[i].getBoundaries();
                if (Array.isArray(childBoundaries)) {
                    for (let j = 0; j < childBoundaries.length; j++) {
                        combined.push(childBoundaries[j]);
                    }

                } else {
                    combined.push(childBoundaries);
                }
            }
            return combined;

        } else {
            return this.boundary;
        }
    }
}











let p = new Point([0, 0]);
document.writeln("Hello world");
document.writeln(p);
