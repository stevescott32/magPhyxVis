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



class HilbertCurve {
    depth;
    boundary;
    children = [];
    capacity;
    traverseList = [];
    points = [];
    isDivided = false;
    orientationAgainstParent;
    constructor(boundary, capacity, orientationAgainstParent) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.orientationAgainstParent = orientationAgainstParent;
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
        var x = this.boundary.xy[0];
        var y = this.boundary.xy[1];
        var w = this.boundary.wh[0];
        var h = this.boundary.wh[1];

        var nw = new Boundary(x, y, w / 2, h / 2);
        var ne = new Boundary(x + w / 2, y, w / 2, h / 2);
        var sw = new Boundary(x, y + h / 2, w / 2, h / 2);
        var se = new Boundary(x + w / 2, y + h / 2, w / 2, h / 2);

        if (this.orientationAgainstParent === 0) {
            this.children[0] = new HilbertCurve(sw, this.capacity, -1);
            this.children[1] = new HilbertCurve(nw, this.capacity, 0);
            this.children[2] = new HilbertCurve(ne, this.capacity, 0);
            this.children[3] = new HilbertCurve(se, this.capacity, 1);
        }
        // southwest
        else if (this.orientationAgainstParent === -1){
            this.children[0] = new HilbertCurve(sw, this.capacity, -1);
            this.children[3] = new HilbertCurve(nw, this.capacity, 0);
            this.children[2] = new HilbertCurve(ne, this.capacity, 0);
            this.children[1] = new HilbertCurve(se, this.capacity, 1);
        }
        // southeast
        else if (this.orientationAgainstParent === 1){
            this.children[2] = new HilbertCurve(sw, this.capacity, -1);
            this.children[1] = new HilbertCurve(nw, this.capacity, 0);
            this.children[0] = new HilbertCurve(ne, this.capacity, 0);
            this.children[3] = new HilbertCurve(se, this.capacity, 1);
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










let hc = new HilbertCurve(new Boundary([2,2], [10, 10]), 1, 0);
hc.insertPoint(new Point([3,3]));
