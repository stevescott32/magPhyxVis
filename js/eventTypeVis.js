/**
 * Class for the vis containing a timeline chart for the selected
 * event type
 */
class EventTypeVis {
    constructor(numEvents) {
        this.circleSize = 2;
        this.highlightScale = 2;

        this.config = {
            width: 850, // 1200,
            height: (this.circleSize * 2) * numEvents,
            padding: {
                left: 80,
                top: 100,
                bottom: 5,
                right: 10
            },
            tolerance: 0.1, // amount to add to the slider max for floating comparison
            stepCount: 30, // how many steps the slider should have
            filterTimeThreshold: 180,
            distanceThreshold: null
        };

        this.state = {
            match: null,
            ordering: 'hausdorff'
        }

        this.divId = 'event-type-vis';

        this.registerHeaderEvents();
    }

    registerHeaderEvents() {
        const root = d3.select('#' + this.divId)
        const header = root.select('.header')
        const self = this;
        header.select('.match-a-to-b')
            .on('click', function () {
                const prevMatch = this.classList.contains("match")
                if (prevMatch) {
                    this.classList.remove('match')
                    self.removeEventsMatch()
                } else {
                    this.classList.add('match')
                    self.state.match = {}
                }
            })
    }

    removeEventsMatch() {
        if (!this.state.match) {
            return;
        }
        if (this.state.match.eventA) {
            this.unhighlightSimulation(this.state.match.eventA.simulationIndex)
        }
        if (this.state.match.eventB) {
            this.unhighlightSimulation(this.state.match.eventB.simulationIndex)
        }
        const root = d3.select('#' + this.divId)
        root.select('svg').select('g.arrows').remove()
        this.state.match = null;
    }

    setParamVis(paramVis) {
        this.paramVis = paramVis;
    }

    setScatterVis(scatter) {
        this.scatter = scatter;
    }

    setEventCols(eventCols) {
        this.eventCols = eventCols;
    }

    highlightSimulation(simulation) {
        // console.log(`Highlighting group${simulation} in eventTypeVis`);
        d3.select(`#${this.divId}`)
            .selectAll(`.group${simulation}`)
            .selectAll('circle')
            // .attr('r', () => { return this.circleSize * this.highlightScale; })
            .classed('event-highlighted', true)
            ;
    }

    unhighlightSimulation(simulation) {
        d3.select(`#${this.divId}`)
            .selectAll(`.group${simulation}`)
            .selectAll('circle')
            .attr('r', () => { return this.circleSize; })
            .classed('event-highlighted', false)
            ;
    }

    unhighlightAllSimulations() {
        d3.selectAll(`.event-highlighted`)
            .attr('r', () => { return this.circleSize; })
            .classed('event-highlighted', false)
            ;
    }

    // methods outside of this class should call this update method,
    // not the update helper
    update(data, paramData, distances) {
        const self = this;

        this.diffMin = d3.min(distances);
        this.diffMax = d3.max(distances) + this.config.tolerance;
        this.originalData = [...data];
        this.originalParamData = [...paramData];
        this.originalDistances = [...distances];

        const root = d3.select(`#${this.divId}`)

        root.select('.match-exact').on('click', function() {
            self.state.matchExact = this.checked;
            self.updateHelper(data, paramData, distances);
        })

        root.select('.ordering-methods').selectAll('input').each(function() {
            d3.select(this).on('change', function() {
                self.state.ordering = this.value;
                self.updateHelper(data, paramData, distances);
            })
        });

        const sliders = root.select('.sliders');

        sliders.select('.filter-distances')
            .select('input')
            .attr('min', this.diffMin)
            .attr('max', this.diffMax)
            .attr('step', ((this.diffMax - this.diffMin) / this.config.stepCount))
            .on('click', function() {
                self.config.distanceThreshold = +this.value;
                // because events may not be in the new data set
                if (self.state.match) {
                    self.removeEventsMatch()
                    root.select('.header').select('.match-a-to-b')
                        .dispatch('click')
                }
                self.updateHelper(data, paramData, distances);
            })

        const minw = 200, maxw = window.innerWidth;
        sliders.select('.graph-width')
            .select('input')
            .attr('min', minw)
            .attr('value', self.config.width)
            .attr('max', maxw)
            .attr('step', 0.1)
            .on('click', function() {
                self.config.width = +this.value;
                self.updateHelper(data, paramData, distances);
            })

        const minh = 200, maxh = window.innerHeight * 5;
        sliders.select('.graph-height')
            .select('input')
            .attr('min', minh)
            .attr('value', self.config.height)
            .attr('max', maxh)
            .attr('step', 0.1)
            .on('click', function() {
                self.config.height = +this.value;
                self.updateHelper(data, paramData, distances);
            })

        const minr = 2, maxr = 10;
        sliders.select('.circle-radius')
            .select('input')
            .attr('min', minr)
            .attr('value', self.circleSize)
            .attr('max', maxr)
            .attr('step', 0.1)
            .on('click', function() {
                self.circleSize = +this.value;
                self.updateHelper(data, paramData, distances);
            })

        const mint = 0, maxt = 1200;
        sliders.select('.time-range')
            .select('input')
            .attr('min', mint)
            .attr('value', self.config.filterTimeThreshold)
            .attr('max', maxt)
            .attr('step', 0.1)
            .on('click', function() {
                self.config.filterTimeThreshold = +this.value;
                self.updateHelper(data, paramData, distances);
            })

        this.updateHelper(data, paramData, distances);

    }

    correlateEvents(infoA, infoB, timeScale, eventCountScale) {
        const simulationDistance = new SimulationDistance();

        const dataA = this.filterEventByTimeThreshold(this.originalData[infoA.simulationIndex])
        const dataB = this.filterEventByTimeThreshold(this.originalData[infoB.simulationIndex])

        let arrowInfo = []
        if (this.state.ordering === 'dtw') {
            arrowInfo = simulationDistance.getDTWDistance(dataA, dataB, d => d[' t']).pairs.map(d => [d.a, d.b])
        } else if (this.state.ordering === 'hausdorff') {
            if (this.state.matchExact) {
                arrowInfo = simulationDistance.getCorrelatingEventDistances(dataA, dataB)[1]
            } else {
                arrowInfo = simulationDistance.getEventsDistance(dataA, dataB, d => d[' t']).map((d, i) => [i, d])
            }
        }

        const svg = d3.select(`#${this.divId}`).select('svg')
        let arrows = svg.select('g.arrows')
        if (arrows.empty()) {
            arrows = svg.append('g')
                .attr('class', 'arrows')
        }

        const arrowSel = arrows.selectAll('path')
            .data(arrowInfo);

        arrowSel.enter()
            .append('path')
            .merge(arrowSel)
            .attr('marker-mid', this.state.ordering === 'dtw' || this.state.matchExact ? 'none' : 'url(#arrow)')
            .attr('d', d => {
                // Coordinates of mid point on line to add new vertex.
                const sourceX =  timeScale(dataA[d[0]][' t']);
                const sourceY = eventCountScale(infoA.renderIndex)
                const targetX = timeScale(dataB[d[1]][' t'])
                const targetY = eventCountScale(infoB.renderIndex)
                const midX = (targetX - sourceX) / 2 + sourceX;
                const midY = (targetY - sourceY) / 2 + sourceY;

                return 'M' + sourceX + ',' + sourceY + 'L' + midX + ',' + midY + 'L' + targetX + ',' + targetY;
            })
            .attr('stroke', 'green')
            .attr('stroke-width', 2);

        arrowSel.exit()
            .remove();

    }

    getEventCountScale(data) {
        return d3.scaleLinear()
            .domain([0, data.length])
            .range([this.config.padding.top, this.config.height + this.config.padding.top])
        ;
    }

    getTimeScale(data) {
        return d3.scaleLinear()
            .domain(
                [0, d3.max(data, (sim) => {
                    return d3.max(sim, (d) => {
                        return d[' t'];
                    })
                })]
            )
            .range([this.config.padding.left, this.config.width + this.config.padding.left])
    }

    filterEventByTimeThreshold(event) {
        return event.filter(d => {
            return d[' t'] < this.config.filterTimeThreshold;
        })
    }

    getTimeFilteredData(data) {
        data = [...data]
        for (let i = 0; i < data.length; i++) {
            data[i] = this.filterEventByTimeThreshold(data[i])
        }
        return data;
    }

    // update the event type vis with the new data
    updateHelper(data, paramData, distances) {
        const self = this;

        if (null == data) { return; }

        const simulationDistances = new SimulationDistance();
        if (self.state.reorderSimulationIndex != null) {
            data = simulationDistances.reorder(data, self.state.reorderSimulationIndex, self.state.ordering);
        } else {
            data = data.map( (d, i) => ({
                simulationIndex: i,
                data: d
            }))
        }

        [data, paramData, distances] = this.getDataFilteredByDistance(data, this.config.distanceThreshold)

        data = this.getTimeFilteredData(data)

        const timeScale = this.getTimeScale(data)

        const eventCountScale = this.getEventCountScale(data);

        if (self.state.match && self.state.match.eventA != null && self.state.match.eventB != null) {
            self.correlateEvents(self.state.match.eventA, self.state.match.eventB, timeScale, eventCountScale)
        }

        const root = d3.select(`#${this.divId}`);

        this.svg = root.select('svg.event-type-vis')
        if (this.svg.empty()) {
            this.svg = root.append('svg')
                .attr('class', 'event-type-vis')
                .attr('id', 'event-type-svg')

            this.svg.append("svg:defs")
                .append("marker")
                .attr("id","arrow")
                .attr("viewBox","0 -5 10 10")
                .attr("refX",5)
                .attr("refY",0)
                .attr("markerWidth",4)
                .attr("markerHeight",4)
                .attr("orient","auto")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("class","arrowHead")

        }

        this.svg.attr('width', () => { return this.config.width + this.config.padding.left + this.config.padding.right; })
            .attr('height', () => { return this.config.height + this.config.padding.top + this.config.padding.bottom; })

        let distanceScale = d3.scaleLinear()
            .domain([d3.min(distances), d3.max(distances)])
            .range([0, 20])
            ;

        d3.selectAll('.distance-svg').remove();
        this.dimComparisonSvg = d3.select(`#${this.divId}`)
            .append('svg')
            .attr('class', 'distance-svg')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 500)
            .attr('height', 500)
            .append('g')
            .attr('class', 'dimSvg')
            ;

        const distanceBarsSel = this.svg.selectAll('.distanceBars')
            .data(distances)

        distanceBarsSel.exit().remove();

        distanceBarsSel
            .enter()
            .append('rect')
            .merge(distanceBarsSel)
            .attr('x', (d, i) => {
                console.log('datum', d)
                return 20 - distanceScale(d);
            })
            .attr('y', (d, i) => { return eventCountScale(i) })
            .attr('width', (d) => {
                return distanceScale(d)
            })
            .attr('height', 1)
            .attr('class', 'distanceBars')

        this.svg.selectAll('g.axis').remove();
        let xaxis = this.svg.append('g').attr('class', 'axis')
            .attr('transform', `translate(0, ${this.config.padding.left + 10})`)
            ;
        let yaxis = this.svg.append('g').attr('class', 'axis')
            .attr('transform', `translate(${this.config.padding.top - 30}, 0)`)
            ;

        let topAxis = d3.axisTop()
            .scale(timeScale);
        let leftAxis = d3.axisLeft()
            .scale(eventCountScale)
            ;

        xaxis.call(topAxis);
        yaxis.call(leftAxis);

        let labels = this.svg.select('g.labels')
        if (labels.empty()) {
            labels = this.svg.append('g')
                .attr('class', 'labels')
        } else {
            labels.selectAll('text').remove();
        }

        labels.append('text')
            .attr('x', this.config.padding.left + this.config.width / 2)
            .attr('y', this.config.padding.top / 2)
            .text('Time')
            ;

        labels.append('text')
            .attr('transform', `rotate(-90)`)
            .attr('y', this.config.padding.left / 2)
            .attr('x', -(this.config.padding.top + this.config.height / 2))
            .text('Simulation')
            ;

        let simulationGroup = this.svg.select('g.simulations')
        if (simulationGroup.empty()) {
            simulationGroup = this.svg.append('g')
                .attr('class', 'simulations')
        }
        const simsSel = simulationGroup.selectAll('.oneSimulation')
            .data(data)

        const sims = simsSel
            .enter()
            .append('g')
            .merge(simsSel)
            .attr('class', (d, i) => { return `oneSimulation group${d[0].simulationIndex}`; })

        simsSel.exit().remove();

        let paramVis = this.paramVis;
        let scatter = this.scatter;

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
            .attr('time', d => { return d[' t']; })
            .attr('simulationIndex', d => { return d.simulationIndex; })
            .attr('class', 'eventTimelinePoint')
            .attr('cx', d => { return timeScale(+d[' t']); })
            .attr('cy', d => { return eventCountScale(d.parentIndex) })
            .attr('r', d => { return this.circleSize; })
            .style('fill', d => {
                // if (+d[' t'] > 50) { return 'white'; }
                return Utils.getFill(d[' event_type']);
            })
            .on('mouseover', function (d) {
                if (self.state.match) {
                    self.state.match.hover = d.simulationIndex
                    self.highlightSimulation(d.simulationIndex)
                }
                scatter.highlightSimulation(d.index);
                paramVis.highlightSimulation(d.index);
                d3.select(this)
                    .attr('r', () => { return self.circleSize * self.highlightScale; });
            })
            .on('mouseout', function (d) {
                if (self.state.match) {
                    if (self.state.match.hover != null) {
                        const indexA = (self.state.match.eventA || {}).simulationIndex;
                        const indexB = (self.state.match.eventB || {}).simulationIndex;

                        if (self.state.match.hover !== indexA && self.state.match.hover !== indexB) {
                            self.unhighlightSimulation(self.state.match.hover)
                            delete self.state.match.hover
                        }
                    }
                }
                d3.select(this)
                    .attr('r', () => { return self.circleSize; });
                scatter.unhighlightSimulation(d.index);
                paramVis.unhighlightSimulation(d.index);
            })
            .on('click', function (d, i) {
                if (self.state.match) {
                    if (self.state.match.eventA && self.state.match.eventB) {
                        // there was an old match
                        self.removeEventsMatch()
                        self.state.match = {}
                    }
                    if (!self.state.match.eventA) {
                        const simulationGroup = this.parentNode;
                        const renderIndex = [...simulationGroup.parentNode.children].indexOf(simulationGroup)
                        self.state.match.eventA = { simulationIndex: d.simulationIndex, renderIndex }
                        self.highlightSimulation(d.simulationIndex);
                    } else if (!self.state.match.eventB) {
                        if (d.simulationIndex !== self.state.match.eventA) {
                            const simulationGroup = this.parentNode;
                            const renderIndex = [...simulationGroup.parentNode.children].indexOf(simulationGroup)
                            self.state.match.eventB = { simulationIndex: d.simulationIndex, renderIndex }
                            self.highlightSimulation(d.simulationIndex);
                            self.correlateEvents(self.state.match.eventA, self.state.match.eventB, timeScale, eventCountScale)
                        } else {
                            self.removeEventsMatch()
                            self.state.match = {}
                        }
                    }
                } else {
                    // eventVis.updateDimensionComparison(d, paramData);
                    self.colorDimsByDistance(d['parentIndex'], paramData);

                    self.state.reorderSimulationIndex = +d3.select(this).attr("simulationIndex")

                    self.updateHelper(self.originalData, self.originalParamData, self.originalDistances);
                }
            })
            ;
    }



    getDataFilteredByDistance(data, value) {
        let filteredData = [];
        let filteredPamaData = [];
        let filteredDistances = [];
        console.log(this.originalDistances)
        data.forEach(({ simulationIndex, data }) => {
            // console.log(`Comparing ${this.originalDistances[i]}`);
            if (value == null || this.originalDistances[simulationIndex] <= value) {
                filteredData.push(this.originalData[simulationIndex]);
                filteredPamaData.push(this.originalParamData[simulationIndex]);
                filteredDistances.push(this.originalDistances[simulationIndex]);
            }
        })
        console.log('Filtered data', filteredData, filteredDistances);
        return [filteredData, filteredPamaData, filteredDistances]
    }

    colorDimsByDistance(pointIndex, paramData) {
        console.log('point index: ', pointIndex);
        let targetPoint = paramData[pointIndex];
        let distances = [];
        for (let i = 0; i < paramData.length; i++) {
            let distance = Utils.calculateDistance(targetPoint, paramData[i]);
            distances.push(distance);
        }
        let colorScale = d3.scaleLinear()
            .range(["#ffffff", "#000000"])
            // .range(["#000000", "#ffffff"])
            .domain([0, d3.max(distances)])
            ;

        for (let i = 0; i < distances.length; i++) {
            this.svg.selectAll(`.group${i}`)
                .selectAll('circle')
                .style('fill', colorScale(distances[i]))
                .attr('distance', distances[i])
                ;
        }
    }

    updateDimensionComparison(point, paramData) {
        let myConfig = {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            },
            height: {
                min: 2,
                max: 150
            }
        }
        d3.selectAll('.dimSvg').selectAll('.tick').remove();
        d3.selectAll('.dimensionBars').remove();
        this.unhighlightAllSimulations();
        this.highlightSimulation(point.simulationIndex);
        this.highlightSimulation(point.simulationIndex + 1);

        let firstParam = parseCommand(paramData[point.simulationIndex]);
        let secondParam = parseCommand(paramData[point.simulationIndex + 1]);
        let diff = [];
        for (let key in firstParam) {
            if (key != 'id' && key != 'parent' && key != 'originalCommand'
                && key != 'command' && key != 'url') {
                console.log(`diff for ${key}: ${Math.abs(firstParam[key] - secondParam[key])}`);
                let oneDiff = {
                    col: key,
                    diff: Math.abs(firstParam[key] - secondParam[key])
                }
                diff.push(oneDiff);
            }
        }
        let barScale = d3.scaleLinear()
            .domain([0, d3.max(diff, (d) => {
                return d.diff;
            })])
            .range([myConfig.height.min, myConfig.height.max])
            ;

        let dimBars = this.dimComparisonSvg.selectAll('.dimensionBars')
            .data(diff)

        dimBars.merge(dimBars.enter())
            .append('rect')
            .attr('x', (d, i) => {
                return i * 20;
            })
            .attr('y', (d) => {
                return 0;
            })
            .attr('width', 15)
            .attr('height', (d) => {
                return barScale(d.diff);
            })
            .attr('col', (d) => d.col)
            .attr('diff', (d) => d.diff)
            .attr('class', 'dimensionBars')
            .style('fill', 'blue')
            ;

        // let xaxis = this.dimComparisonSvg.append('g')
        //     .attr('transform', `translate(0 ${myConfig.padding.top * (3 / 4)})`)
        //     ;
        let yaxis = this.dimComparisonSvg.append('g')
            .attr('transform', `translate(130 0)`)
            ;

        // let topAxis = d3.axisTop()
        //     .scale(xscale);
        let leftAxis = d3.axisRight()
            .scale(barScale)
            ;

        // xaxis.call(topAxis);
        yaxis.call(leftAxis);

        /* this.dimComparisonSvg.append('text')
            // .attr('x', xscale(0.0))
            .attr('x', bar(0))
            .attr('y', myConfig.padding.top / 2)
            .text('Theta')
            ;*/

        this.dimComparisonSvg.append('g')
            .attr('transform', `rotate(90)`)
            .append('text')
            .attr('y', myConfig.padding.left + 30)
            .attr('x', 30)
            .text('Std. Dev.')
            ;
    }
}



class SimulationDistance {
    // data = [];
    paramData = [];
    paramDistances = [];
    constructor(){

    }

    reorder(data, simulationIndex, ordering){
        console.log('reorder data by sim index ', simulationIndex, 'ordering', ordering);
        console.log('data length', data.length, 'sim click', data[simulationIndex][0].simulationIndex)

        const data_sum = [];

        let main_datum;
        for(let i=0; i<data.length; i++){
            // let sum = this.getSimulationDistanceBySum(this.getCorrelatingEventDistances(data[simulationIndex], data[i]));
            let min;
            if (ordering === 'dtw') {
                min = this.getDTWDistance(data[simulationIndex], data[i], d => d[' t']).distance;
            } else if (ordering === 'hausdorff') {
                min = this.getMinInArray(this.getCorrelatingEventDistances(data[simulationIndex], data[i])[0]);
            }
            if (i !== simulationIndex) {
                data_sum.push({
                    "data": data[i],
                    "min": min,
                    simulationIndex: i,
                });
            } else {
                main_datum = {
                    simulationIndex: i,
                    data: data[i],
                    min: 0
                };
            }
        }

        data_sum.sort((obj1, obj2) => obj1['min'] - obj2['min']);

        const reOrderedData = [main_datum];
        data_sum.forEach(element => {
            reOrderedData.push(element)
        });

        console.log('reordered data', reOrderedData)

        return reOrderedData;
    }

    getMinInArray(arr){
        let min = Number.MAX_VALUE;
        arr.forEach(num => {
            if (num < min){
                min = num;
            }
        });
        return min;
    }




    // update(data, paramData, paramDistances){
    //     this.data = data;
    //     this.paramData = paramData;
    //     this.paramDistances = paramDistances;




    //     let correlatingEventDistances = this.getCorrelatingEventDistances(data[0], data[1]);
    //     console.log(correlatingEventDistances);
    //     console.log(this.getSimulationDistanceBySum(correlatingEventDistances));

    // }
    getSimulationDistanceBySum(correlatingEventDistances){
        let sum = 0;
        correlatingEventDistances.forEach(distance => {
            sum += distance;
        });
        return sum;
    }

    // returns array of distances of sets of points
    getCorrelatingEventDistances(events1,  events2){
        let smallEvents = events1
        let largeEvents = events2
        const valueSelector = d => d[' t']
        let smallEventsDistances = this.getEventsDistance(smallEvents, largeEvents, valueSelector);
        let largeEventsDistances = this.getEventsDistance(largeEvents, smallEvents, valueSelector);

        let correlatingPointsDistances = [];
        const pairs = []
        for (let i=0; i<largeEventsDistances.length; i++){
            let possibleCorrelatingPoint = largeEventsDistances[i];
            if (smallEventsDistances[possibleCorrelatingPoint] == i){
                let distance = Math.abs(smallEvents[possibleCorrelatingPoint][' t'] - largeEvents[i][' t']);
                correlatingPointsDistances.push(distance);
                pairs.push([possibleCorrelatingPoint, i])
            }
        }
        return [correlatingPointsDistances, pairs];
    }

    // returns array of indexes from correlating array of closest event
    getEventsDistance(events1, events2, valueSelector){
        let correlatingEventDistances = [];
        for (let i=0; i<events1.length; i++){
            correlatingEventDistances.push(this.getClosestEventIndex(valueSelector(events1[i]), events2, valueSelector) );
        }
        return correlatingEventDistances;
    }

    // returns index of closest event in correlating array
    getClosestEventIndex(value, arr, valueSelector){
        let minIndex = 0;
        let minValue = Number.MAX_SAFE_INTEGER;



        for (let i=0; i<arr.length; i++){
            let difference = Math.abs(value - valueSelector(arr[i]));
            if (difference < minValue){
                minValue = difference;
                minIndex = i;
            }
        }

        return minIndex;
    }

    getDTWDistance(eventA, eventB, datumSelector = d => d) {
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

    getDTWDistanceWithDeaths(eventA, eventB, datumSelector = d => d) {
        const NA = eventA.length;
        const NB = eventB.length;
        const MaxDeaths = NA + NB;

        const dtw =
            new Array(MaxDeaths + 1)
                .fill(null)
                .map(_ => {
                    return new Array(NA + 1)
                        .fill(null)
                        .map(_ => new Array(NB + 1).fill(1e9))
                })

        dtw[0][0][0] = 0;

        const getValidMins = (coords) => coords
            .filter(([d, i, j]) => d >= 0 && i >= 0 && j >= 0)
            .map(([d, i, j]) => dtw[d][i][j]);

        for (let d = 0; d <= MaxDeaths; ++d) {
            for (let i = 0; i <= NA; ++i) {
                for (let j = 0; j <= NB; ++j) {
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
                    const candidates = getValidMins([[d, i - 1, j], [d, i, j - 1], [d, i - 1, j - 1]]);
                    if (candidates.length > 0) {
                        dtw[d][i][j] = Math.min(...candidates) + dist;
                    }
                    // kill top, i - 1, j
                    if (d > 0) {
                        const candidates = getValidMins([[d - 1, i - 1, j], [d - 1, i, j - 1]])
                        if (candidates.length > 0) {
                            dtw[d][i][j] = Math.min(dtw[d][i][j], ...candidates);
                        }
                    }
                }
            }
        }

        return dtw;
    }

}
