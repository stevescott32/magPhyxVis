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
    // */

    // compare consecutive points to see if the xs match
    let totalTries = 0;
    let totalRemoved = 0;
    let removedPoints = [];
    for(let i = points.length - 1; i > 0; i--) {
        let curr = points[i];
        if(undefined == curr) { break; }
        let j = i - 1;
        let next = points[j];
        while(j > 0 && undefined != next
            // && totalTries ++ < 15
            && Math.abs(curr.coordinates[0] - next.coordinates[0]) < tolerance) {
                let diffX = Math.abs(curr.coordinates[0] - next.coordinates[0]);
                console.log('Diffx of ' + diffX + ' was less than tol ' + tolerance);
                // console.log(i + ' Curr.coordinates[0]: ' + curr.coordinates[0] 
                // + ' - ' + j + ' next.coordinates[0]: ' + next.coordinates[0])
            // console.log('Comparing pos ' + i + ' against ' + j);
            // console.log(curr, next);
            if(Math.abs(curr.coordinates[1] - next.coordinates[1]) < tolerance) {
                let diffY = Math.abs(curr.coordinates[1] - next.coordinates[1]);
                console.log('Diffy of ' + diffY + ' was less than tol ' + tolerance);
                // console.log('Curr.coordinates[1]: ' + curr.coordinates[1] 
                // + ' next.coordinates[1]: ' + next.coordinates[1])

                let removed = points.splice(i, 1);
                console.log('removed a point', removed);
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
    points = shuffle(points);

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