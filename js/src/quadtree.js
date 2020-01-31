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
        if(isNaN(capacity)) { throw 'capacity ' + capacity + ' is not a number - invalid'; }
        this.boundary = boundary;
        this.capacity = capacity;
    }

    getBoundary() { return this.boundary; }

    insertPoint(point) {
        for (let p in this.points) {
            if (this.points[p].compareTo(point)) {
                console.log('Cannot insert point ' + p.toString()
                  + ' because it is already in this tree');
                  // throw "Insertion error";
                  return -1;
            }
        }
        if (!this.boundary.contains(point)) {
            console.log('Point out of the boundary');
            return -1; 
        } 
        // this point belongs at this tree level
        if (this.points.length < this.capacity && !this.isDivided) {
            this.points.push(point);
            // console.log('Successfully inserted the point' + point.toString());
            return 0;
        }
        
        if(!this.isDivided) {
            this.subdivide();
        }
        return this.addToChildren(point);
    }

    addToChildren(point) {
        if (this.northEast.getBoundary().contains(point)) {
            // console.log('Inserting to the ne');
            return 1 + this.northEast.insertPoint(point);
        } else if (this.northWest.getBoundary().contains(point)) {
            // console.log('Inserting to the nw');
            return 1 + this.northWest.insertPoint(point);
        } else if (this.southEast.getBoundary().contains(point)) {
            // console.log('Inserting to the se');
            return 1 + this.southEast.insertPoint(point);
        } else if (this.southWest.getBoundary().contains(point)) {
            // console.log('Inserting to the sw');
            return 1 + this.southWest.insertPoint(point);
        }
        console.log('How did we get here?');
        return -1;
    }

    subdivide() {
        var x = this.boundary.xy[0];
        var y = this.boundary.xy[1];
        var w = this.boundary.wh[0];
        var h = this.boundary.wh[1];

        var sw = new Boundary(x, y, w / 2, h / 2);
        var se = new Boundary(x + w / 2, y, w / 2, h / 2);
        var nw = new Boundary(x, y + (h / 2), w / 2, h / 2);
        var ne = new Boundary(x + w / 2, y + h / 2, w / 2, h / 2);

        this.northEast = new QuadTree(ne, this.capacity);
        this.northWest = new QuadTree(nw, this.capacity);
        this.southEast = new QuadTree(se, this.capacity);
        this.southWest = new QuadTree(sw, this.capacity);
        this.isDivided = true;

        for(let p in this.points) {
            this.addToChildren(this.points[p]);
        }
        this.points = [];
    }

    getDepth() {
        if(!this.isDivided) { return 1; }
        else {
            return 1 + Math.max(
                this.southWest.getDepth(), 
                this.southEast.getDepth(),
                this.northWest.getDepth(),
                this.northEast.getDepth()
            )
        }
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