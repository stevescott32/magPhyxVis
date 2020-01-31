function testCompareTo() {
    let positive = new Point(1.0, 2.2, 0);
    if(positive.getX() != 1.0) {
        throw ("ERROR: " + positive.getX() 
            + " is not the same as the constructor set value of "
            + 1.0);
    }

    let twin1 = new Point(1.2, 3.4, 1);
    let twin2 = new Point(1.2, 3.4, 2);
    if(!twin1.compareTo(twin2)) {
        throw ("ERROR: " + twin1.toString() 
        + " was not the same as " + twin2.toString())
    }

    if(twin1.compareTo(positive)) {
        throw ("ERROR: " + twin1.toString() 
        + " is not the same as " + positive.toString())
    }

}

testCompareTo();
console.log("Point tests successful");
