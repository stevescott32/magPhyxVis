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
    dims = [];
    dims.push(dataElement['theta'].toFixed(5));
    dims.push(dataElement['beta'].toFixed(5));
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

function parseCommand(param) {
    // TODO: don't call this method on commands that are already parsed
    if (param.constructor == Object) {
        return param;
    }
    let command = param['columns'][0];
    let split = command.split(' ');
    let value = {
        r: +split[6],
        angleFromOrigin: +split[7],
        momentAngle: +split[8],
        theta: +split[9],
        beta: +split[10],
        angularMomentum: +split[11]
    }
    return value;
}

function standardizeParamData(paramData) {
    console.log("Standardizing param data");
    let parsed = [];
    for (let i = 0; i < paramData.length; i++) {
        parsed.push(parseCommand(paramData[i]));
    }

    let means = {};
    let stdDevs = {};
    for (let key in parsed[0]) {
        stdDevs[key] = Utils.standardDeviation(parsed, key);
        means[key] = Utils.dictionaryAverage(parsed, key);
    }
    console.log('Means', means);
    console.log('stdDevs', stdDevs);
    let result = [];
    for(let i = 0; i < paramData.length; i++) {
        result.push({});
        for(let key in parsed[i]) {
            if(stdDevs[key] == 0) { result[i][key] = 0; }
            else {
                result[i][key] = (parsed[i][key] - means[key]) / stdDevs[key];
            }
        }
        result[i]['originalCommand'] = paramData[i];
    }

    return result;
}


function calcDistances(data) {
    let distances = [];
    let derived = data.map((d) => {
        return parseCommand(d);
    })
    distances.push(0)
    for (let d = 1; d < derived.length; d++) {
        let myDist = Math.sqrt(
            Math.pow((derived[d].theta - derived[d - 1].theta), 2) + 
            Math.pow((derived[d].beta - derived[d - 1].beta), 2) 
        )
        distances.push(myDist);
    }
    return distances;
}

function makeHilbertCurve(data) {
    let points = [];
    for (let i = 0; i < data.length; i++) {
        points.push(new Point(getDimensions(data[i].param), data[i]));
    }

    points = filterPoints(points, 0.1);
    let boundary = new Boundary([-3, -3], [3, 3]);
    // let ktree = new KTree(boundary, 1);
    let hilbertCurve = new HilbertCurve(boundary, 1, 0);
    for (let i = 0; i < points.length; i++) {
        hilbertCurve.insertPoint(points[i]);
    }
    hilbertCurve.setTraverseList();
    return hilbertCurve;
}

function makeKtTree(data) {
    let points = [];
    for (let i = 0; i < data.length; i++) {
        points.push(new Point(getDimensions(data[i].param), data[i]));
    }

    points = filterPoints(points, 0.1);
    let boundary = new Boundary([-3, -3], [3, 3]);
    let ktree = new KTree(boundary, 1);
    for (let i = 0; i < points.length; i++) {
        ktree.insertPoint(points[i]);
    }
    ktree.setTraverseList();
    return ktree;
}

function makeTravelingSalesman(data){
    let points = [];
    for (let i = 0; i < data.length; i++) {
        points.push(new Point(getDimensions(data[i].param), data[i]));
    }

    points = filterPoints(points, 0.0005);
     let travelingSalesman = new TravelingSalesman(points);
     travelingSalesman.setTraverseList();
    return travelingSalesman;
}

