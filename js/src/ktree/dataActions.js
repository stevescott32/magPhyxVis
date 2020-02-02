function filterPoints(points, tolerance) {
    // sort points by their x value
    points = points.sort((a, b) => {
        if (a.coordinates[0] < b.coordinates[0]) {
            return -1;
        }
        if (a.coordinates[0] > b.coordinates[0]) {
            return 1;
        }
        // a must be equal to b
        return 0;
    });

    // compare consecutive points to see if the xs match
    let totalRemoved = 0;
    for (let i = points.length - 1; i > 0; i--) {
        let curr = points[i];
        if (undefined == curr) { break; }
        let j = i - 1;
        let next = points[j];
        while (j > 0 && undefined != next
            && Math.abs(curr.coordinates[0] - next.coordinates[0]) < tolerance) {
            if (Math.abs(curr.coordinates[1] - next.coordinates[1]) < tolerance) {
                let removed = points.splice(i, 1);
                totalRemoved++;
                break;
            } else {
                j--;
                next = points[j];
            }
        }
    }
    console.log('Removed ' + totalRemoved + ' points as being within tolerance');

    // shuffle the array so as to avoid causing excessive recursion in the ktree
    // points = shuffle(points);

    // return our new set of points
    return points;
}

// taken from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function getDimensions(dataElement) {
    let command = dataElement['columns'][0];
    let split = command.split(' ');

    let value = {
        theta: +split[9],
        beta: +split[10],
    }
    dims = [];
    dims.push(value.theta.toFixed(5));
    dims.push(value.beta.toFixed(5));
    return dims;
}

function reorderData(ktree) {
    let orderedData = [];
    for (let i = 0; i < ktree.traverseList.length; i++) {
        orderedData.push(ktree.traverseList[i].data);
    }
    console.log('My ordered data is ', orderedData);
    return orderedData;
}

function makeKTree(data) {
    if (settings.dontReorder) return data;

    let points = [];
    for (let i = 0; i < data.length; i++) {
        points.push(new Point(getDimensions(data[i].param), data[i]));
    }

    points = filterPoints(points, 0.0005);
    let boundary = new Boundary([-0.06, 0.05], [-0.05, 0.06]);
    let ktree = new KTree(boundary, 1);
    for (let i = 0; i < points.length; i++) {
        ktree.insertPoint(points[i]);
    }
    ktree.setTraverseList();
    return ktree;
}

