const root = d3.select('#root');

const svg = root.select('svg');

const bounds = svg.node().getBoundingClientRect();

const height = 100;

let chartsData = [];

const generateEventsChart = (timeSelector) => {
    data = chartsData
    const top = 300, height = 400;
    const circleSize = 5;
    const left = circleSize * 2, width = bounds.width - circleSize * 2 * 2;

    const eventCountScale = d3.scaleLinear()
            .domain([0, data.length])
            .range([top, top + height])

    const timeScale = d3.scaleLinear()
        .domain(
            [
                d3.min(data, d => d3.min(d, d => timeSelector(d))),
                d3.max(data, d => d3.max(d, d => timeSelector(d))),
            ]
        )
        .range([left, left + width])

    let simulationGroup = svg.select('g.simulations')
    if (simulationGroup.empty()) {
        simulationGroup = svg.append('g')
            .attr('class', 'simulations')
    }
    const simsSel = simulationGroup.selectAll('.oneSimulation')
        .data(data)

    simsSel.exit().remove();

    const sims = simsSel
        .enter()
        .append('g')
        .merge(simsSel)
        .attr('class', 'oneSimulation')

    // append a circle for every event in the vis
    const circleSel = sims.selectAll('circle')
        .data((d, i) => {
            for (let a = 0; a < d.length; a++) {
                d[a]['parentIndex'] = i;
            }
            return d;
        });

    circleSel.exit().remove();


    circleSel
        .enter()
        .append('circle')
        .merge(circleSel)
        .attr('time', d => { return timeSelector(d); })
        .attr('simulationIndex', d => { return d.simulationIndex; })
        .attr('class', 'eventTimelinePoint')
        .attr('cx', d => { return timeScale(timeSelector(d)); })
        .attr('cy', d => { return eventCountScale(d.parentIndex) })
        .attr('r', d => { return circleSize; })
        .style('fill', d => {
            return 'green'
        })
        .on('click', function (datum) {
            const mainEvent = chartsData[datum.parentIndex]
            const deaths = +range.node().value;
            const newData = chartsData.map((d, i) => {
                const dtw = sd.getDTWDistanceWithDeaths(mainEvent, d, timeSelector);
                const candidates = []
                for (let j = 0; j <= deaths; ++j) {
                    candidates.push(dtw[j][mainEvent.length][d.length][0])
                }
                console.log(i, candidates)
                return {
                    distance: i === datum.parentIndex ? 0 : Math.min(...candidates),
                    datum: d
                }
            })
            console.log(newData)
            chartsData = newData.sort((da, db) => {
                return da.distance - db.distance
            }).map(d => d.datum)
            generateEventsChart(timeSelector)
        })
}

const generateChart = (group_name, data, params = {}) => {
    params = {
        ...params,
        color: params.color || "black",
        offsetY: params.offsetY || 0
    }

    let group = svg.select('g#' + group_name)

    if (group.empty()) {
        group = svg
            .append('g')
            .attr('id', group_name)
            .attr('transform', `translate(0, ${params.offsetY})`)
    }

    let rect = group.select('rect.background');
    if (rect.empty()) {
        rect = group.append('rect')
            .attr('class', 'background')
            .attr('fill', 'white')
            .attr('stroke-width', 2)
            .attr('stroke', 'black')
            .attr('height', height)
            .attr('width', bounds.width)
    }

    let bar = group.select('rect.bar')
    if (bar.empty()) {
        bar = group.append('rect')
            .attr('class', 'bar')
            .attr('width', 2)
            .style('pointer-events', 'none')
            .attr('fill', 'black')
            .attr('height', height)
    }

    let pointGroup = group.select('g.points')
    if (pointGroup.empty()) {
        pointGroup = group.append('g')
            .attr('class', 'points')
            .attr('pointer-events', 'none')
    }

    let distanceScale = d3.scaleLinear()
        .domain([0, bounds.width])
        .range([0, bounds.width])

    const pointSel = pointGroup
        .selectAll('circle')
        .data(data)

    pointSel.exit().remove()

    pointSel.enter()
        .append('circle')
        .merge(pointSel)
        .attr('fill', params.color)
        .attr('cx', d => d)
        .attr('cy', height / 2)
        .attr('r', 5)

    rect.on('mousemove', function () {
        const coordinates= d3.mouse(this);
        const x = coordinates[0];

        bar.style('visibility', 'visible')
            .attr('x', x)
    })

    rect.on('mouseout', function () {
        bar.style('visibility', 'hidden')
    })

    rect.on('mousedown', function() {
        const coordinates= d3.mouse(this);
        const x = coordinates[0];
        data.push(x);
        // data must be sorted even if insertion is done randomly
        data = data.sort((a, b) => a - b);
        generateChart(group_name, data, params)
    })

};

let dataA = [];
let dataB = [];

const getGroupOffset = (index = 0) => index * (height + 20);
const getYMid = (index = 0) => getGroupOffset(index) + height / 2;
const sd = new SimulationDistance();
let dtw;

const buildMatchingEvents = (deaths, datumSelector = d => d) => {
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
            console.log('kill row1', i + 1)
        } else if (d > 0 && k !== 2 && dtw[d - 1][i][j - 1][k] === dtw[d][i][j][k]) {
            d--;
            j--;
            console.log('kill row1', j + 1)
            matchPair = false;
        } else {
            console.log('this is a bug')
            break;
        }
        if (matchPair) {
            pairs.push(pair)
        }
    }
    return {
        distance: dtw[deaths][NA][NB][0],
        pairs
    }
}

const range = root.select('.dtw-deaths');
const drawCorrelation = (data1, data2, index1, index2, color, method) => {
    let indices = sd
        .getEventsDistance(data1, data2, d => d)
        .map((d, i) => ({ a: i, b: d }))

    if (method === 'dtw') {
        const deaths = +range.node().value;
        const result = buildMatchingEvents(deaths)
        indices = result.pairs
        console.log(result);
    } else if (method === 'dist_basic') {
        const matchBtoA = sd
            .getEventsDistance(data2, data1, d => d)
            .map((d, i) => ({ a: d, b: i }))
        indices = indices.concat(matchBtoA)
    }

    const distanceScale = d3.scaleLinear()
        .domain([0, bounds.width])
        .range([0, bounds.width])

    let arrows = svg.select('g.arrows')
    if (arrows.empty()) {
        arrows = svg.append('g')
            .attr('class', 'arrows')
    }

    const arrowSel = arrows.selectAll('line')
        .data(indices);

    arrowSel.enter()
        .append('line')
        .merge(arrowSel)
        .attr('x1', (d, i) => distanceScale(data1[d.a]))
        .attr('y1', getYMid(index1))
        .attr('x2', (d, i) => distanceScale(data2[d.b]))
        .attr('y2', getYMid(index2))
        .attr('stroke', color)
        .attr('stroke-width', 2);

    arrowSel.exit()
        .remove();

}

const register_button_handlers = () => {
    root.select('.match-a-to-b').on('click', function() {
        drawCorrelation(dataA, dataB, 0, 1, 'green')
    })
    root.select('.match-b-to-a').on('click', function() {
        drawCorrelation(dataB, dataA, 1, 0, 'red')
    })
    root.select('.match-both').on('click', function() {
        drawCorrelation(dataB, dataA, 1, 0, 'red', 'dist_basic')
    })
    range.attr('value', 0)
    root.select('.match-dtw').on('click', function() {
        dtw = sd.getDTWDistanceWithDeaths(dataA, dataB)
        drawCorrelation(dataA, dataB, 0, 1, 'red', 'dtw')
        range.attr('max', dataA.length + dataB.length)
    })

    range.on('click', function() {
        root.select('.death-count').html(this.value)
        drawCorrelation(dataA, dataB, 0, 1, 'red', 'dtw')
    })

    root.select('.add-event-a').on('click', function() {
        chartsData.push(dataA.map(d => ({ time: d})))
        generateEventsChart(d => d.time)
    })

    root.select('.add-event-b').on('click', function() {
        chartsData.push(dataB.map(d => ({ time: d})))
        generateEventsChart(d => d.time)
    })
    root.select('.clear-event-a').on('click', function() {
        dataA = []
        generateChart('event1', dataA, { color: 'green' });
        drawCorrelation([], [], 0, 1, 'green', 'dist_basic')
    })

    root.select('.clear-event-b').on('click', function() {
        dataB = []
        generateChart('event2', dataB, { color: 'red' });
        drawCorrelation([], [], 0, 1, 'green', 'dist_basic')
    })
}

register_button_handlers()

generateChart('event1', dataA, { color: 'green' });
generateChart('event2', dataB, { color: 'red', offsetY: getGroupOffset(1) });
