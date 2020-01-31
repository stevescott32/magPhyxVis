function testInsertPoint() {
    let boundary = new Boundary(0, 0, 1, 1);
    let quadtree = new QuadTree(boundary, 1);
    for(let i = 0; i < 100; i++) {
        let point = new Point(Math.random(), Math.random(), i);
        assertTrue(quadtree.insertPoint(point) >= 0, 
            "The point " + point.toString() + " could not be inserted");
    }
}

function testLevel() {
    let boundary = new Boundary(0, 0, 1, 1);
    let quadtree = new QuadTree(boundary, 1);
    let point1 = new Point(0.1, 0.1, 1);
    let level = quadtree.insertPoint(point1); 
    let success = level == 0;
    assertTrue(success, 
        "The point " + point1.toString() + " was inserted at level " + level 
        + ", not at level 0");
    assertTrue(quadtree.getDepth() == 1, 
        "The tree depth was " + quadtree.getDepth() + " instead of 1");
    
    let point2 = new Point(0.9, 0.9, 2);
    level = quadtree.insertPoint(point2); 
    success = level == 1;
    assertTrue(success, 
        "The point " + point2.toString() + " was inserted at level " + level 
        + ", not at level 1");
    assertTrue(quadtree.getDepth() == 2, 
        "The tree depth was " + quadtree.getDepth() + " instead of 2");


    let point3 = new Point(0.1, 0.9, 3);
    level = quadtree.insertPoint(point3); 
    success = level == 1;
    assertTrue(success, 
        "The point " + point3.toString() + " was inserted at level " + level 
        + ", not at level 1");
    assertTrue(quadtree.getDepth() == 2, 
        "The tree depth was " + quadtree.getDepth() + " instead of 2");

        /*
    let tmp = new Point(0.9, 0.1, "tmp");
    level = quadtree.insertPoint(tmp); 
    success = level == 1;
    assertTrue(success, 
        "The point " + tmp.toString() + " was inserted at level " + level 
        + ", not at level 1");
        */


    let point4 = new Point(0.2, 0.2, 4);
    level = quadtree.insertPoint(point4); 
    success = level == 3;
    assertTrue(success, 
        "The point " + point4.toString() + " was inserted at level " + level 
        + ", not at level 3");
    assertTrue(quadtree.getDepth() == 4, 
        "The tree depth was " + quadtree.getDepth() + " instead of 4");

}


// testInsertPoint();
testLevel();
console.log('Successfully completed the quadtree tests');
