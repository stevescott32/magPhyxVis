class PointScaling{
    MAX_NUMBER = 2 ** 31;
    points = [];
    encodedPoints = [];
    dimensions;
    dimensionMins;
    dimensionMaxs;
    constructor(points, dimensions){
        Object.freeze(this.MAX_NUMBER);
        this.points = points;
        this.dimensions = dimensions;
        this.dimensionMins = this.getPointsMins();
        this.dimensionMaxs = this.getPointMaxs();
        this.encodedPoints = this.scale(this.points);
    }
    getPointsMins(){
        let mins = [];

        for (let i = 0; i<this.dimensions; i++){
            mins[i] = Infinity;
            for (let point of this.points){
                if (point[i] < mins[i]) {
                    mins[i] = point[i];
                }
            }
        }
        return mins;
    }

    getPointMaxs(){
        let maxs = [];

        for (let i = 0; i<this.dimensions; i++){
            maxs[i] = Number.NEGATIVE_INFINITY;
            for (let point of this.points){
                if (point[i] > maxs[i]) {
                    maxs[i] = point[i];
                }
            }
        }
        return maxs;
    }




    scale(point){
        let encodedPoints = [];


        for (let point in this.points){
            encodedPoints[point] = [];
            for (let i = 0; i<this.dimensions; i++){
                let multiplier = parseInt((this.points[point][i] - this.dimensionMins[i]) / (this.dimensionMaxs[i] - this.dimensionMins[i]));
                encodedPoints[point][i] = this.MAX_NUMBER*multiplier;
                console.log(multiplier);
            }
        }

        return encodedPoints;
    }
}


class Point{
    coordinates = [];
    constructor(coordinates){
        this.coordinates = coordinates;
    }
    getDistanceToPoint(destination){
        let summation = 0;
        if (this.coordinates.length === destination.coordinates.length){
            for (let i=0; i<this.coordinates.length; i++){
                summation += Math.pow(this.coordinates[i] - destination.coordinates[i], 2);
            }
        }
        return Math.sqrt(summation);
    }
    toString(){
        let string = "[";
        for (let coordinate in this.coordinates){
            if (coordinate < this.coordinates.length - 1) {
                string += this.coordinates[coordinate] + ", ";
            }
            else{
                string += this.coordinates[coordinate] + "]";
            }
        }
        return string;
    }
}

let vertexes = [
    [0,1,2],
    [0,4,3],
    [0,3,4],
    [10,10,2],
    [1,1,3],
    [-1, 0,9]
];
let hilbertCodeEncoding = new PointScaling(vertexes, 3);


for (let point of PointScaling.encodedPoints){
    document.writeln("[" + point + "]" + "<br>");
}
