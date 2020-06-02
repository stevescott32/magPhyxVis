const buildMatchingEvents = (dtw, dataA, dataB, deaths, datumSelector = d => d) => {
    const NA = dataA.length;
    const NB = dataB.length;
    // not possible with deaths
    if (dtw[deaths][NA][NB][0] === 1e9) {
        return {
            distance: 1e9,
            pairs: []
        }
    }
    const pairs = [];
    let d = deaths;
    let i = NA, j = NB, k = 0;
    while (i >= 1 && j >= 1) {
        const datumA = dataA[i - 1];
        const datumB = dataB[j - 1];
        const cost = Math.abs(datumSelector(datumA) - datumSelector(datumB));
        let matchPair = true;
        const pair = { a: i - 1, b: j - 1 }
        if (dtw[d][i - 1][j][2] + cost === dtw[d][i][j][k]) {
            i--;
            k = 2;
        } else if (dtw[d][i][j - 1][1] + cost === dtw[d][i][j][k]) {
            j--;
            k = 1;
        } else if (dtw[d][i - 1][j - 1][0] + cost === dtw[d][i][j][k]) {
            i--;
            j--;
            k = 0;
        } else if (d > 0 && k !== 1 && dtw[d - 1][i - 1][j][k] === dtw[d][i][j][k]) {
            d--;
            i--;
            matchPair = false;
        } else if (d > 0 && k !== 2 && dtw[d - 1][i][j - 1][k] === dtw[d][i][j][k]) {
            d--;
            j--;
            matchPair = false;
        } else {
            console.log('this is a bug')
            break;
        }
        if (matchPair) {
            pairs.push(pair)
        }
    }

    const edge_list = pairs.map(d => ({ a: d.a, b: d.b + NA }))
    let earthMoverDistance = 0;

    const components = union_find(edge_list)
    components.forEach(component => {
        const values = component.map(vertex => {
            if (vertex < NA) {
                return datumSelector(dataA[vertex]);
            } else {
                return datumSelector(dataB[vertex - NA]);
            }
        })
        console.log(values)
        const center = Utils.arrayAverage(values);
        earthMoverDistance += values.reduce((acc, val) => {
            console.log(Math.abs(val - center))
            return Math.abs(val - center)
        })
    })

    console.log({ earthMoverDistance })

    return {
        distance: dtw[deaths][NA][NB][0] + earthMoverDistance,
        pairs
    }
}

const getDTWDistance = (eventA, eventB, datumSelector = d => d) => {
    const NA = eventA.length;
    const NB = eventB.length;
    const dtw = new Array(NA + 1)
        .fill(null)
        .map(_ => new Array(NB + 1).fill(1e9))
    dtw[0][0] = 0;
    for (let i = 1; i <= NA; ++i) {
        for (let j = 1; j <= NB; ++j) {
            const datumA = eventA[i - 1];
            const datumB = eventB[j - 1];
            const dist = Math.abs(datumSelector(datumA) - datumSelector(datumB));
            dtw[i][j] = Math.min(...[dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]]) + dist;
        }
    }
    const pairs = [];
    let i = NA, j = NB;
    while (i >= 1 || j >= 1) {
        const datumA = eventA[i - 1];
        const datumB = eventB[j - 1];
        const cost = Math.abs(datumSelector(datumA) - datumSelector(datumB));
        pairs.push({ a: i - 1, b: j - 1 });
        if (dtw[i - 1][j] + cost === dtw[i][j]) {
            i--;
        } else if (dtw[i][j - 1] + cost === dtw[i][j]) {
            j--;
        } else {
            i--;
            j--;
        }
    }
    return {
        distance: dtw[NA][NB],
        pairs
    }
}

const getDTWDistanceWithDeaths = (eventA, eventB, datumSelector = d => d, maxDeaths) => {
    const NA = eventA.length;
    const NB = eventB.length;
    let MaxDeaths = maxDeaths != null ? maxDeaths : NA + NB;

    const dtw =
        new Array(MaxDeaths + 1)
            .fill(null)
            .map(_ => {
                return new Array(NA + 1)
                    .fill(null)
                    .map(_ => new Array(NB + 1).fill(null).map(_ => {
                        return new Array(3).fill(1e9);
                    }))
            })

    dtw[0][0][0][0] = 0;
    dtw[0][0][0][1] = 0;
    dtw[0][0][0][2] = 0;

    const getValidMins = (coords) => coords
        .filter(([d, i, j, _]) => d >= 0 && i >= 0 && j >= 0)
        .map(([d, i, j, k]) => dtw[d][i][j][k]);

    for (let d = 0; d <= MaxDeaths; ++d) {
        for (let i = 0; i <= NA; ++i) {
            for (let j = 0; j <= NB; ++j) {
                // k=0 nothing among i, j was used
                // k=1 ith element was used
                // k=2 jth element was used
                for (let k = 0; k < 3; ++k) {
                    if (d + i + j === 0) {
                        continue;
                    }
                    let dist;
                    if (i > 0 && j > 0) {
                        const datumA = eventA[i - 1];
                        const datumB = eventB[j - 1];
                        dist = Math.abs(datumSelector(datumA) - datumSelector(datumB));
                    } else {
                        // cant match
                        dist = 1e9;
                    }
                    const candidates = getValidMins([[d, i - 1, j, 2], [d, i, j - 1, 1], [d, i - 1, j - 1, 0]]);
                    if (candidates.length > 0) {
                        dtw[d][i][j][k] = Math.min(...candidates) + dist;
                    }
                    // kill top, i - 1, j
                    if (d > 0) {
                        const validPoses = [[]]
                        if (k !== 1) {
                            validPoses.push([d - 1, i - 1, j, k])
                        }
                        if (k !== 2) {
                            validPoses.push([d - 1, i, j - 1, k])
                        }
                        const candidates = getValidMins(validPoses)
                        if (candidates.length > 0) {
                            dtw[d][i][j][k] = Math.min(dtw[d][i][j][k], ...candidates);
                        }
                    }
                }
            }
        }
    }

    return dtw;
}

