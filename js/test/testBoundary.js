function testContainsPoint() {
    let boundary = new Boundary(0, 0, 1, 1);
    let middle = new Point(0.5, 0.5, 0);

    if(!boundary.contains(middle)) {
        throw "Boundary contains method did not work for a point in its middle";
    }

    let edge = new Point(0, 0.5, 1);
    if(!boundary.contains(edge)) {
        throw "Boundary contains method did not work for a point on its edge";
    }
    let corner1 = new Point(0.0000001, 0.0000001, 2);
    let corner2 = new Point(0.99999999, 0.99999999, 3);
    if(!boundary.contains(corner1) || !boundary.contains(corner2)) {
        throw "Boundary did not contain its corners";
    }

    let outsideRight = new Point(1.1, 0.5, 4);
    let outsideLeft = new Point(-0.5, 0.5, 5);
    let outsideAbove = new Point(0.5, 1.5, 5);
    let outsideBelow = new Point(0.5, -0.5, 6);
    let closeRight = new Point(1.01, 0.5, 7);
    let closeAbove = new Point(0.5, 1.01, 8);
    if(boundary.contains(outsideRight) || boundary.contains(outsideLeft)
        || boundary.contains(outsideAbove) || boundary.contains(outsideBelow)
        || boundary.contains(closeRight) || boundary.contains(closeAbove)
    ) {
        throw "Boundary contained points outside of itself";
    }
}

testContainsPoint();
console.log('Boundary tests successful');
