function calculateTNWDistance(sim1, sim2) {
    let tndDist = getTNWScore(sim1, sim2).cellMax;
    // console.log('TNW Distance: ', result);
    return tndDist * -1;
}

function getTNWScore(sim1, sim2) {
    // console.log('Calculating TNW score ', simulation1, simulation2);
    let simulation1 = sim1.events.filter((d) => { return d.on; });
    let simulation2 = sim2.events.filter((d) => { return d.on; });

    // first sequence is vertical
    // second sequence is horizontal
    var matrix = []
    const GAP_SCORE = -1
    const MATCH_SCORE = 1
    const MAX_OFFSET_PENALTY = -1

    // initialize first row
    let firstRow = []
    for (let i = 0; i < simulation2.length + 1; i++) {
        // firstRow[i] = i * GAP_SCORE
        firstRow[i] = { cellMax: i * GAP_SCORE, arrowImage: null }
    }
    matrix.push(firstRow)

    // initialize first column
    for (let i = 1; i < simulation1.length + 1; i++) {
        let row = Array(simulation2.length + 1).fill(null, 1, simulation2.length + 1)
        // row[0] = i * GAP_SCORE
        row[0] = { cellMax: i * GAP_SCORE, arrowImage: null }
        matrix.push(row)
    }

    // fill in the rest of the table
    for (let i = 1; i < simulation1.length + 1; i++) {
        for (let j = 1; j < simulation2.length + 1; j++) {
            let arrowImage = 'd.png'
            let match = matrix[i - 1][j - 1].cellMax + MATCH_SCORE + offsetPenalty(simulation1[i], simulation2[j], MAX_OFFSET_PENALTY)
            let vGap = matrix[i - 1][j].cellMax + GAP_SCORE
            let hGap = matrix[i][j - 1].cellMax + GAP_SCORE
            let cellMax
            if (match >= vGap && match >= hGap) {
                cellMax = match
                arrowImage = 'd.png'
                if (match === vGap && match === hGap) arrowImage = 'dsu.png'
                if (match === vGap) arrowImage = 'du.png'
                if (match === hGap) arrowImage = 'ds.png'
            }
            else if (vGap >= match && vGap >= hGap) {
                cellMax = vGap
                arrowImage = 'u.png'
                if (vGap === match && vGap === hGap) arrowImage = 'dsu.png'
                if (vGap === match) arrowImage = 'du.png'
                if (vGap === hGap) arrowImage = 'su.png'
            }
            else if (hGap >= match && hGap >= vGap) {
                cellMax = hGap
                arrowImage = 's.png'
                if (hGap === match && hGap === vGap) arrowImage = 'dsu.png'
                if (hGap === match) arrowImage = 'ds.png'
                if (hGap === vGap) arrowImage = 'su.png'
            }

            matrix[i][j] = { 'cellMax': cellMax, 'arrowImage': arrowImage }
        }
    }

    // console.log(matrix)
    // if (simulation1.length != simulation2.length) makeTable(matrix)
    let result = matrix[matrix.length - 1][(matrix[matrix.length - 1].length - 1)]
    return result;
}

function offsetPenalty(event1, event2, MAX_OFFSET_PENALTY) {
    if (event1 === undefined || event2 === undefined) {
        return MAX_OFFSET_PENALTY
    }

    event1 = event1.t
    event2 = event2.t

    return MAX_OFFSET_PENALTY * (Math.abs(event1 - event2) / Math.max(event1, event2))
}

function makeTable(data) {
    console.log('making table')
    let table = document.querySelector("table")
    for (let element of data) {
        let row = table.insertRow();
        for (let key in element) {
            let cell = row.insertCell();
            let roundedNum = element[key].cellMax.toFixed(2)
            let text = document.createTextNode(roundedNum);
            cell.appendChild(text);
            cell.setAttribute("style", `background-image: url(../assets/images/${element[key].arrowImage}); background-repeat: no-repeat; background-size: 100% 20px`)
        }
    }


}
