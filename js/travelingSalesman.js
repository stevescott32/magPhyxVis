class TravelingSalesman{
    points = [];
    traverseList = [];

    constructor(vertexes){
        let points = [];
        for (let vertex of vertexes){
            let point = new Point(vertex);
            points.push(point);
        }
        this.points = points;
    }

    getNearest(current){
        let nearestIndex;
        let nearestDistance = Infinity;
        for (let i=0; i<this.points.length; i++) {
            if (this.points[i] !== null) {
                let distance = current.getDistanceToPoint(this.points[i]);
                if (distance !== 0 && distance < nearestDistance) {
                    nearestIndex = i;
                    nearestDistance = distance;
                }
            }
        }
        if (nearestDistance === 0) console.log("Failed in getNearest (nearestDistance = 0");
        return nearestIndex;
    }



    setTraverseList(){
        let currentIndex = 0;
        let len = this.points.length;

        for (let i=0; i<len; i++){
            this.traverseList[i] = this.points[currentIndex];
            let nearestIndex = this.getNearest(this.points[currentIndex]);
            this.points[currentIndex] = null;
            currentIndex = nearestIndex;

        }
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
    [0,1],
    [0,4],
    [0,3],
    [10,10],
    [1,1]
];


let travelingSalesman = new TravelingSalesman(vertexes);
travelingSalesman.setTraverseList();
document.writeln(travelingSalesman.traverseList);

