
class Point{
     coordinates = [];
    constructor(coordinates){
        this.coordinates = coordinates
    }
    toString(){
        let toReturn = "[";
        for (let i=0; i<this.coordinates.length; i++){

            toReturn = toReturn.concat(this.coordinates[i] );
            if (i+1 !== this.coordinates.length){
                toReturn = toReturn.concat(", ")
            }
        }
        toReturn = toReturn.concat("]");
        return toReturn;
    }
    equals(p){
        for (let i=0; i<this.coordinates.length; i++){
            if (this.coordinates[i] !== p.coordinates[i]){
                return false;
            }
        }
        return true;
    }
}
class Boundary{
    dimensionMins = [];
    dimensionMaxs = [];

    constructor(dimensionMins, dimensionMaxs){
        this.dimensionMaxs = dimensionMaxs;
        this.dimensionMins = dimensionMins;

    }
    contains(point){
        for (let i=0; i<point.coordinates.length; i++){
            if (point.coordinates[i] <= this.dimensionMins[i] || point.coordinates[i] > this.dimensionMaxs[i])
                return false;
        }
        return true;
    }
    toString(){
        let toReturn = "[";
        for (let i=0; i<this.dimensionMins.length; i++){

            toReturn = toReturn.concat(this.dimensionMins[i] );
            if (i+1 !== this.dimensionMins.length){
                toReturn = toReturn.concat(", ")
            }
        }
        toReturn = toReturn.concat("]  [");
        for (let i=0; i<this.dimensionMaxs.length; i++){

            toReturn = toReturn.concat(this.dimensionMaxs[i] );
            if (i+1 !== this.dimensionMaxs.length){
                toReturn = toReturn.concat(", ")
            }
        }
        toReturn = toReturn.concat("]");
        return toReturn;
    }
}
class KTree{
    boundary;
    children = [];
    capacity;
    traverseList = [];
    points = [];
    isDivided = false;
    constructor(boundary, capacity){
        this.boundary = boundary;
        this.capacity = capacity;
    }
    insertPoint(point){
        if (this.boundary.contains(point)){
            if (this.isDivided){
                for (let i=0; i<this.children.length; i++){
                    this.children[i].insertPoint(point);
                }
            }
            else{
                this.points.push(point);
                if (this.points.length > this.capacity){
                    this.subdivide();
                    for (let i=0; i<this.points.length; i++){
                        for (let j=0; j<this.children.length; j++){
                            this.children[j].insertPoint(this.points[i]);
                        }
                    }
                    this.points = [];
                }
            }
        }
    }


    subdivide(){
        for (let i=0; i<2 ** this.boundary.dimensionMins.length ; i++){
            let map = this.iterate(this.boundary.dimensionMins.length, i);
            let mins = [];
            let maxs = [];
            for (let j=0; j<map.length; j++){
                if (map[j] === "0"){
                    mins.push(this.boundary.dimensionMins[j]);
                    maxs.push((this.boundary.dimensionMaxs[j] + this.boundary.dimensionMins[j])/2);
                }
                else if (map[j] === "1"){
                    mins.push((this.boundary.dimensionMaxs[j] + this.boundary.dimensionMins[j])/2);
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
            let binary = (index>>>0).toString(2);
            for (let i=0; i<binary.length; i++){
                arr.push(binary[i]);
            }
            arr = this.fillOutArray(arr, dimensions);
            return arr;
    }
    fillOutArray(arr, dimensions){
        while(arr.length < dimensions){
            arr.splice(0,0,"0");
        }
        return arr;
    }
setTraverseListHelper(){
    var traverseList = [];
    if (this.isDivided){
        for (let child=0; child<this.children.length; child++){
            for (let i=0; i<this.children[child].setTraverseListHelper().length; i++){
                traverseList.push(this.children[child].setTraverseListHelper()[i]);
            }
        }

    }
    for (let i=0; i<this.points.length; i++){
        traverseList.push(this.points[i]);
    }
    return traverseList;
}
setTraverseList(){
    this.traverseList = this.setTraverseListHelper();
}

}
let boundary = new Boundary([0,0], [10,10]);
let ktree = new KTree(boundary, 1);

let ind = 0;
for (let i=1; i<3; i++){
    for (let j=1; j<3; j++){
        ktree.insertPoint(new Point([i,j]));
        ind++;
    }
}
ktree.setTraverseList();
document.writeln("num inserted: " + ind + "<br>traverseList.length: " + ktree.traverseList.length + "<br>");
for (let point in ktree.traverseList){
    document.writeln(ktree.traverseList[point] + "<br>");
}









// printout(){
//     return this.printoutHelper(this, "", "");
// }
// printoutHelper(tree, toReturn, recLevel){
//     recLevel += "= ";
//     if(tree.isDivided){
//         for (let i=0; i<tree.children.length; i++){
//             toReturn += this.printoutHelper(tree.children[i]);
//         }
//     }
//     else {
//         if (tree.points.length > 0) {toReturn+="<br />";}
//         for (let p=0; p<tree.points.length; p++){
//             if (p < tree.points.length-1){
//                 toReturn += recLevel + tree.points[p].asString() + "<br />";
//             }
//             else {toReturn += recLevel + tree.points[p].asString();}
//         }
//     }
//     return toReturn;
// }
// setTraverseListHelper(){
//     var traverseList = [];
//     if (this.isDivided){
//         for (let i in this.southWest.setTraverseListHelper()){
//             traverseList.push(this.southWest.setTraverseListHelper()[i]);
//         }
//         for (let i in this.southEast.setTraverseListHelper()){
//             traverseList.push(this.southEast.setTraverseListHelper()[i]);
//         }
//         for (let i in this.northWest.setTraverseListHelper()){
//             traverseList.push(this.northWest.setTraverseListHelper()[i]);
//         }
//         for (let i in this.northEast.setTraverseListHelper()){
//             traverseList.push(this.northEast.setTraverseListHelper()[i]);
//         }
//
//     }
//     for (let i in this.points){
//         traverseList.push(this.points[i]);
//     }
//     return traverseList;
// }
// setTraverseList(){
//     this.traverseList = this.setTraverseListHelper();
// }



