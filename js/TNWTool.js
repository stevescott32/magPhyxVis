const root = d3.select('#root');

const svg = root.select('svg');

const bounds = svg.node().getBoundingClientRect();

const height = 100;

let dataA = [];
let dataB = [];

const getGroupOffset = (index = 0) => index * (height + 20);
const getYMid = (index = 0) => getGroupOffset(index) + height / 2;

const range = root.select('.dtw-deaths');

const maxOffsetPenalty = root.select('.max-offset-penalty')
const match = root.select('.match')
const gap = root.select('.gap')


const clearTable = function () {
     let table = document.querySelector("table")
     for (const child of table.children) {
         table.removeChild(child)
     }
}

const backtrace = function (data) {
    // console.log(data)
    let trace = []

    let j = data[data.length -1].length - 1
    let i = data.length - 1
    while (i !== 0 && j !== 0) {
        // let cell = document.getElementById(`${i},${j}`)
        // cell.setAttribute("style", "background-color: rgba(255,0,0,0.2);")
        if (data[i][j].direction === directions.DIAGONAL) {
                i--
                j--
                trace.push({ a: i, b: j })

            } else if (data[i][j].direction === directions.SIDE ) j--
            else i--
    }
    // cell = document.getElementById(`0,0`)
    // cell.setAttribute("style", "background-color: rgba(255,0,0,0.2);")
    // console.log(trace)
    return trace
} 


const makeTable = function (data) {
    let table = document.querySelector("table")
    for (let element in data) {
        let row = table.insertRow();
        for (let key in data[element]) {
            let cell = row.insertCell();
            let roundedNum = data[element][key].cellMax.toFixed(2)  
            let text = document.createTextNode(roundedNum);
            cell.appendChild(text);
            cell.setAttribute("style", `background-image: url(../assets/images/${data[element][key].direction}); 
                                        background-repeat: no-repeat; 
                                        background-size: 100% 20px;
                                        background-color: aqua;`)
            cell.setAttribute("id", `${element},${key}`)

        }
    }
    return backtrace(data)
}

const drawTNWCorrelation = (dataA, dataB, index1, index2, color) => {
    // console.log(dataA, dataB)
    let indices = makeTable(getTNWScore(
        dataA,
        dataB,
        parseInt(gap.node().value),
        parseInt(match.node().value), 
        parseInt(maxOffsetPenalty.node().value),
        d => d,
        d => d,
        matrix => matrix
        ))
   
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

    for (const correlation of indices) {
        arrowSel.enter()
            .append('line')
            .merge(arrowSel)
            .attr('x1', distanceScale(dataA[correlation.a]))
            .attr('y1', getYMid(index1))
            .attr('x2', distanceScale(dataB[correlation.b]))
            .attr('y2', getYMid(index2))
            .attr('stroke', color)
            .attr('stroke-width', 5)
    }
    arrowSel.exit()
        .remove();
}

const register_button_handlers = () => {
    range.attr('value', 0)

    root.select('.match-tnw').on('click', function() {
        clearTable()
        drawTNWCorrelation(dataA, dataB, 0, 1, 'red')
    })

    range.on('click', function() {
        root.select('.death-count').html(this.value)
        drawCorrelation(dataA, dataB, 0, 1, 'red', 'dtw')
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



register_button_handlers()

generateChart('event1', dataA, { color: 'green' });
generateChart('event2', dataB, { color: 'red', offsetY: getGroupOffset(1) });