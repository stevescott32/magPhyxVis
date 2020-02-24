class QuadTree {
    boundary;
    capacity;
    traverseList = [];
    points = [];
    northWest;
    northEast;
    southWest;
    southEast;
    isDivided = false;
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
    }

    insertPoint(point) {
        for (let p in this.points) {
            if (this.points[p].compareTo(point)) return;
        }
        if (!this.boundary.contains(point)) {
            // console.log('Point out of the boundary');
            // console.log('Point', point);
            // console.log('Boundary ', this.boundary);
            return;
        }
        if (this.points.length < this.capacity && !this.isDivided)
            this.points.push(point);
        else {
            if (!this.isDivided) this.subdivide();
            this.northEast.insertPoint(point);
            this.northWest.insertPoint(point);
            this.southEast.insertPoint(point);
            this.southWest.insertPoint(point);
        }
        if (this.isDivided) {
            for (let p in this.points) {
                this.northEast.insertPoint(this.points[p]);
                this.northWest.insertPoint(this.points[p]);
                this.southEast.insertPoint(this.points[p]);
                this.southWest.insertPoint(this.points[p]);
            }
            this.points = [];
        }
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

        this.northEast = new QuadTree(ne, this.capacity, this.pane);
        this.northWest = new QuadTree(nw, this.capacity, this.pane);
        this.southEast = new QuadTree(se, this.capacity, this.pane);
        this.southWest = new QuadTree(sw, this.capacity, this.pane);
        this.isDivided = true;
    }

    printout() {
        return this.printoutHelper(this, "", "");
    }

    printoutHelper(tree, toReturn, recLevel) {
        recLevel += "= ";
        if (tree.isDivided) {
            toReturn += this.printoutHelper(tree.northEast, "", recLevel);
            toReturn += this.printoutHelper(tree.northWest, "", recLevel);
            toReturn += this.printoutHelper(tree.southEast, "", recLevel);
            toReturn += this.printoutHelper(tree.southWest, "", recLevel);
        }
        else {
            if (tree.points.length > 0) { toReturn += "<br />"; }
            for (let p in tree.points) {
                if (p < tree.points.length - 1) {
                    toReturn += recLevel + tree.points[p].asString() + "<br />";
                }
                else { toReturn += recLevel + tree.points[p].asString(); }
            }
        }
        return toReturn;
    }

    setTraverseListHelper() {
        var traverseList = [];
        if (this.isDivided) {
            for (let i in this.southWest.setTraverseListHelper()) {
                traverseList.push(this.southWest.setTraverseListHelper()[i]);
            }
            for (let i in this.southEast.setTraverseListHelper()) {
                traverseList.push(this.southEast.setTraverseListHelper()[i]);
            }
            for (let i in this.northWest.setTraverseListHelper()) {
                traverseList.push(this.northWest.setTraverseListHelper()[i]);
            }
            for (let i in this.northEast.setTraverseListHelper()) {
                traverseList.push(this.northEast.setTraverseListHelper()[i]);
            }

        }
        for (let i in this.points) {
            traverseList.push(this.points[i]);
        }
        return traverseList;
    }

    setTraverseList() {
        this.traverseList = this.setTraverseListHelper();
    }

    genSimulationOrder() {
        let simOrder = [];
        this.traverseList = this.setTraverseListHelper();
        let numPoints = this.traverseList.length;
        console.log('num points', numPoints);
        for(let i = 0; i < numPoints; i++) {
            for (let j = 0; j < numPoints; j++) {
                let point = this.traverseList[j];
                if(point.id == i) {
                    simOrder.push(j);
                    break;
                }
            }
        }
        return simOrder;
    }
}

let NUM_FILES = 100;

// promise the param data
let paramDataPromises = [];
for (let i = 1; i <= NUM_FILES; i++) {
  paramDataPromises.push(
      d3.csv(`data1/commands/commands${('0' + i).slice(-2)}.csv`));
}

Promise.all([...paramDataPromises]).then((paramData) => {
    console.log('Param data loaded', paramData);
    var boundary = new Boundary(-1, -1, 2, 2);
    var quadTree = new QuadTree(boundary, 1);
    // for(let i = 0; i < paramData.length; i++) {
    for(let i = 0; i < 10; i++) {
      let oneData = paramData[i];
      let command = oneData['columns'][0];
      let split = command.split(' ');

      let theta = +split[9];
      let beta = +split[10];
      console.log('theta', theta);
      console.log('beta', beta);
      quadTree.insertPoint(new Point(theta, beta, i));
    }
    console.log('Finished building quad tree');
    quadTree.setTraverseList();
    // let simOrder = quadTree.genSimulationOrder();
    // console.log('simOrder', simOrder);
    // paramVis.init(paramData, simulationOrder);
    console.log('Finished');
  });

var boundary = new Boundary(0, 0, 500, 500);
var quadTree = new QuadTree(boundary, 1);
for (let i = 0; i < 10; i++) {
    quadTree.insertPoint(new Point(Math.random() * 100, Math.random() * 100));
}

quadTree.setTraverseList();
for (let p in quadTree.traverseList) {
    document.write(quadTree.traverseList[p].asString() + "<br />")
}

////

/*
console.log('Building quad tree');
var boundary = new Boundary(-1, -1, 2, 2);
var quadTree = new QuadTree(boundary, 1);
for(let i = 0; i < 100; i++) {
    quadTree.insertPoint(new Point(Math.random(), Math.random(), i));
}
console.log('Quad tree built');
quadTree.setTraverseList();
console.log('traverse list', quadTree.traverseList);
for (let p in quadTree.traverseList) {
    document.write(quadTree.traverseList[p].asString() + "<br />")
}
console.log('Finished traversing');
*/