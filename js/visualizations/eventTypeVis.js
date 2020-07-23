/**
 * Class for the vis containing a timeline chart for the selected
 * event type
 */
class EventTypeVis {
    constructor(/*numEvents*/) {
        this.circleSize = 2;
        this.highlightScale = 2;

        this.config = {
            width: 850, // 1200,
            height: 0, // (this.circleSize * 2) * numEvents,
            padding: {
                left: 80,
                top: 100,
                bottom: 5,
                right: 10
            },
            tolerance: 0.1, // amount to add to the slider max for floating comparison
            stepCount: 30, // how many steps the slider should have
            timeRange: [0, Infinity],
            distanceThreshold: null
        };

        this.state = {
            match: null,
            ordering: 'hausdorff',
            maxDeaths: 0
        }

        this.divId = 'event-type-vis';

        this.registerHeaderEvents();
    }

    setNumSimulations(numSims) {
        this.config.height = (this.circleSize * 2) * numSims;
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
    update(data) {
        console.log('Updating event type vis', data);
        try {
            const self = this;

            this.diffMin = 0; // d3.min(distances);
            this.diffMax = 20; // d3.max(distances) + this.config.tolerance;
            this.originalData = JSON.parse(JSON.stringify(data));
            // this.originalParamData = [...paramData];
            // this.originalDistances = [...distances];

            const root = d3.select(`#${this.divId}`)

            root.select('.match-exact')
              .on('click', function () {
                self.state.matchExact = this.checked;
                self.updateHelper(data);
              })

            const slider = root.select('.ordering-methods')
                .select('.max-deaths')

            const deathCount = root.select('.ordering-methods')
                .select('.death-count')

            slider.on('click', function () {
                self.state.maxDeaths = +this.value;
                deathCount.html(+this.value)
                self.updateHelper(data);
            });

            root.select('.ordering-methods').selectAll('input[type="radio"]').each(function () {
                const node = d3.select(this);
                node.on('change', function () {
                    self.state.ordering = this.value;
                    let disable = false;
                    if (this.value === 'dtw') {
                        disable = false;
                    } else {
                        disable = true;
                    }

                    slider.attr('disabled', disable ? 'disabled' : null);

                    self.updateHelper(data);
                })
            });

            const sliders = root.select('.sliders');

            sliders.select('.filter-distances')
                .select('input')
                .attr('min', this.diffMin)
                .attr('max', this.diffMax)
                .attr('step', ((this.diffMax - this.diffMin) / this.config.stepCount))
                .on('click', function () {
                    self.config.distanceThreshold = +this.value;
                    // because events may not be in the new data set
                    if (self.state.match) {
                        self.removeEventsMatch()
                        root.select('.header').select('.match-a-to-b')
                            .dispatch('click')
                    }
                    self.updateHelper(data);
                });

            const minw = 200, maxw = window.innerWidth;
            sliders.select('.graph-width')
                .select('input')
                .attr('min', minw)
                .attr('value', self.config.width)
                .attr('max', maxw)
                .attr('step', 0.1)
                .on('click', function () {
                    self.config.width = +this.value;
                    self.updateHelper(data);
                });

            const minh = 200, maxh = window.innerHeight * 5;
            sliders.select('.graph-height')
                .select('input')
                .attr('min', minh)
                .attr('value', self.config.height)
                .attr('max', maxh)
                .attr('step', 0.1)
                .on('click', function () {
                    self.config.height = +this.value;
                    self.updateHelper(data);
                });

            const minr = 2, maxr = 10;
            sliders.select('.circle-radius')
                .select('input')
                .attr('min', minr)
                .attr('value', self.circleSize)
                .attr('max', maxr)
                .attr('step', 0.1)
                .on('click', function () {
                    self.circleSize = +this.value;
                    self.updateHelper(data);
                });

            const range = this.getTimeRange(this.originalData);
            self.config.timeRange = range;

            $(".time-range-2").slider({
                min: range[0],
                max: range[1],
                values: range,
                slide: function (event, ui) {
                    $(".amount").html("From " + ui.values[0] + " to " + ui.values[1]);
                    self.config.timeRange = ui.values;
                    self.updateHelper(data);
                }
            });

            $(".amount").html("From " + $(".time-range-2").slider("values", 0) +
                " to " + $(".time-range-2").slider("values", 1));
            this.updateHelper(data);
        }
        catch (error) {
            console.log('Error in event type vis: ', error);
        }
    }

    correlateEvents(data, infoA, infoB, timeScale, eventCountScale) {
        const simulationDistance = new SimulationDistance();

        const eventAIdx = data.findIndex(d => d.simulationIndex === infoA.simulationIndex)
        const eventBIdx = data.findIndex(d => d.simulationIndex === infoB.simulationIndex)

        const eventA = eventAIdx !== -1 ? data[eventAIdx].event : []
        const eventB = eventBIdx !== -1 ? data[eventBIdx].event : []
        let arrowInfo = []
        if (this.state.ordering === 'dtw') {
            const dtw = getDTWDistanceWithDeaths(eventA, eventB, d => d[' t'], this.state.maxDeaths)
            arrowInfo = buildMatchingEvents(dtw, eventA, eventB, this.state.maxDeaths, d => d[' t'])
                .pairs
                .map(d => [d.a, d.b])
        } else if (this.state.ordering === 'hausdorff') {
            if (this.state.matchExact) {
                arrowInfo = simulationDistance.getHausdorffDistances(eventA, eventB)[1]
            } else {
                arrowInfo = simulationDistance.getEventsDistance(eventA, eventB, d => d[' t']).map((d, i) => [i, d])
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
                const sourceX = timeScale(eventA[d[0]][' t']);
                const sourceY = eventCountScale(eventAIdx)
                const targetX = timeScale(eventB[d[1]][' t'])
                const targetY = eventCountScale(eventBIdx)
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
        console.log('Event count scale max: ', data.simulations.length);
        return d3.scaleLinear()
            .domain([0, data.simulations.length])
            .range([this.config.padding.top, this.config.height + this.config.padding.top])
            ;
    }

    getTimeRange(data) {
        // console.log('getting time range from data', data);
        let sims = data.simulations;
        // console.log('debug sims', sims);
        const min = d3.min(sims, (sim) => {
            // console.log('debug sim', d);
            // TODO i think this should be min(sim.events)
            return d3.min(sim.events, (event) => {
                // console.log('debug event', event);
                return event[' t'];
            })
        })
        const max = d3.max(data.simulations, (sim) => {
            return d3.max(sim.events, (event) => {
                return event[' t'];
            })
        })
        // console.log('Time range result', [parseFloat(min), parseFloat(max)]);
        return [parseFloat(min), parseFloat(max)]
    }

    getTimeScale(data) {
        return d3.scaleLinear()
            .domain(this.getTimeRange(data))
            .range([this.config.padding.left, this.config.width + this.config.padding.left])
    }

    filterEventByTimeThreshold(event) {
        return event.filter(d => {
            return d[' t'] > this.config.timeRange[0] && d[' t'] < this.config.timeRange[1];
        })
    }

    getTimeFilteredData(data) {
        // data = [...data]
        /*
        for (let i = 0; i < data.simulations.length; i++) {
            data.simulations[i] = {
                event: this.filterEventByTimeThreshold(data[i].event),
                simulationIndex: data[i].simulationIndex
            }
        }
        */
        return data;
    }

    // update the event type vis with the new data
    updateHelper(data) {
        console.log('Running the update helper', data);
        const self = this;

        if (null == data) { return; }

        // assign id to each event to make everything easier
        // data = data.map((d, i) => ({ event: d, simulationIndex: i }))
        for(let i = 0; i < data.simulations.length; i++) {
            let oneSim = data.simulations[i];
            oneSim.meta['simulationIndex'] = i;
            for(let j = 0; j < oneSim.events.length; j++) {
                oneSim.events[j].simulationIndex = i;
            }
        }

        const simulationDistances = new SimulationDistance();
        // data = this.getTimeFilteredData(data).filter(d => d.event.length > 0)

        // const result = this.getDataFilteredByDistance(data, this.config.distanceThreshold)
        // data = result[0];
        // paramData = result[1];
        // distances = result[2];

        /*
        if (self.state.reorderSimulationIndex != null) {
            data = simulationDistances.reorder(data, self.state.reorderSimulationIndex, self.state.ordering, self.state.maxDeaths);
        }
        */

        const timeScale = this.getTimeScale(data)

        const eventCountScale = this.getEventCountScale(data);

        if (self.state.match && self.state.match.eventA != null && self.state.match.eventB != null) {
            self.correlateEvents(data, self.state.match.eventA, self.state.match.eventB, timeScale, eventCountScale)
        }

        const root = d3.select(`#${this.divId}`);

        this.svg = root.select('svg.event-type-vis')
        if (this.svg.empty()) {
            this.svg = root.append('svg')
                .attr('class', 'event-type-vis')
                .attr('id', 'event-type-svg');

            this.svg.append("svg:defs")
                .append("marker")
                .attr("id", "arrow")
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 5)
                .attr("refY", 0)
                .attr("markerWidth", 4)
                .attr("markerHeight", 4)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("class", "arrowHead");

        }

        this.svg.attr('width', () => { return this.config.width + this.config.padding.left + this.config.padding.right; })
            .attr('height', () => { return this.config.height + this.config.padding.top + this.config.padding.bottom; })

            /*
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
                return 20 - distanceScale(d);
            })
            .attr('y', (d, i) => { return eventCountScale(i) })
            .attr('width', (d) => {
                return distanceScale(d)
            })
            .attr('height', 1)
            .attr('class', 'distanceBars')
            */

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
            .data(data.simulations)
            // .data(data.simulations.map(d => d.event))
            ;

        const sims = simsSel
            .enter()
            .append('g')
            .merge(simsSel)
            .attr('class', (d, i) => {
                // return `oneSimulation group${d[0].simulationIndex}`;
                return `oneSimulation group${i}`;
            })

        simsSel.exit().remove();

        let paramVis = this.paramVis;
        let scatter = this.scatter;

        // append a circle for every event in the vis
        const circleSel = sims.selectAll('circle')
            .data((d, i) => {
                for (let a = 0; a < d.length; a++) {
                    d[a]['parentIndex'] = i;
                }
                return d.events;
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
            .attr('cy', d => { return eventCountScale(d.simulationIndex); })
            .attr('r', d => { return this.circleSize; })
            .style('fill', d => { return data.getColor(d); })
            .on('mouseover', function (d) {
                console.log('Mouseovered the event', d);
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
                        self.state.match.eventA = { simulationIndex: d.simulationIndex }
                        self.highlightSimulation(d.simulationIndex);
                    } else if (!self.state.match.eventB) {
                        if (d.simulationIndex !== self.state.match.eventA) {
                            const simulationGroup = this.parentNode;
                            self.state.match.eventB = { simulationIndex: d.simulationIndex }
                            self.highlightSimulation(d.simulationIndex);
                            self.correlateEvents(data, self.state.match.eventA, self.state.match.eventB, timeScale, eventCountScale)
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
        console.log('Finished updating, reordering');
    }



    getDataFilteredByDistance(data, value) {
        let filteredData = [];
        let filteredPamaData = [];
        let filteredDistances = [];
        data.forEach(datum => {
            const { simulationIndex } = datum;
            if (value == null || this.originalDistances[simulationIndex] <= value) {
                filteredData.push(datum);
                filteredPamaData.push(this.originalParamData[simulationIndex]);
                filteredDistances.push(this.originalDistances[simulationIndex]);
            }
        })
        return [filteredData, filteredPamaData, filteredDistances]
    }

    colorDimsByDistance(pointIndex, paramData) {
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

/*
    Calculates distance between two simulations based on either Hausdorff Distance or Dynamic Time Warping
    Hausdorff Distance: https://en.wikipedia.org/wiki/Hausdorff_distance
    Dynamic Time Warping: https://en.wikipedia.org/wiki/Dynamic_time_warping

    TODO: Decouple DTW and Hausdorff Distance
*/
class SimulationDistance {
    // data = [];
    paramData = [];
    paramDistances = [];
    constructor() {

    }

    getDTWWithDeaths(eventA, eventB, valueSelector, maxDeaths) {
        const dtw = getDTWDistanceWithDeaths(eventA, eventB, valueSelector, maxDeaths)
        let dist = Infinity
        for (let i = 0; i <= maxDeaths; ++i) {
            const match = buildMatchingEvents(dtw, eventA, eventB, i, valueSelector)
            dist = Math.min(dist, match.distance);
        }
        return dist;
    }

    // data is an array of { data: [event time series data], simulationIndex }
    reorder(data, simulationIndex, ordering, maxDeaths) {
        console.log('reorder data by sim index ', simulationIndex, 'ordering', ordering);

        const orderingParent = data.find(d => d.simulationIndex === simulationIndex)
        if (!orderingParent) {
            console.log('Ordering parent filtered out due to time range / distance filters')
            return data
        }

        const data_sum = [];

        let main_datum;
        for (let i = 0; i < data.length; i++) {
            let metric;
            if (ordering === 'dtw') {
                metric = this.getDTWWithDeaths(orderingParent.event, data[i].event, d => d[' t'], maxDeaths)
            } else if (ordering === 'hausdorff') {
                metric = this.getMaxInArray(this.getCorrelatingEventDistances(orderingParent.event, data[i].event)[0]);
            } else if (ordering === 'temporal-needleman-wunsch') {
                metric = this.getTNWScore(orderingParent.event, data[i].event)
            }
            if (data[i].simulationIndex !== simulationIndex) {
                data_sum.push({
                    ...data[i],
                    "metric": metric,
                });
            } else {
                main_datum = {
                    ...data[i],
                    metric: 0
                };
            }
        }

        data_sum.sort((obj1, obj2) => obj1['metric'] - obj2['metric']);

        const reOrderedData = [main_datum];
        data_sum.forEach(element => {
            reOrderedData.push(element)
        });

        return reOrderedData;
    }

    getTNWScore(simulation1, simulation2) {
        console.log(simulation1, simulation2);

        // first sequence is vertical
        // second sequence is horizontal
        var matrix = []
        const GAP_PENALTY = -4
        const MISMATCH_PENALTY = -1
        const MATCH_REWARD = 1
        const MAX_OFFSET_PENALTY = -3

        // initialize first row
        let firstRow = []
        for (let i=0; i<simulation2.length+1; i++) {
            firstRow[i] = i * GAP_PENALTY
        }
        matrix.push(firstRow)

        // initialize first column
        for (let i=1; i<simulation1.length+1; i++){
            let row = Array(simulation2.length+1).fill(null, 1, simulation2.length+1)
            row[0] = i * GAP_PENALTY
            matrix.push(row)
        }

        // fill in the rest of the table
        for (let i=1; i<simulation1.length+1; i++){
            for (let j=1; j<simulation2.length+1; j++){
                
                let cellMax = matrix[i-1][j-1] + MATCH_REWARD + this.offsetPenalty(simulation1[i], simulation2[j], MAX_OFFSET_PENALTY)
                // if (simulation1[i-1] === simulation2[j-1]) {
                //     cellMax = matrix[i-1][j-1] + MATCH_REWARD
                // } else {
                //     cellMax = matrix[i-1][j-1] + MISMATCH_PENALTY
                // }

                if (matrix[i-1][j] + GAP_PENALTY > cellMax) {
                    cellMax = matrix[i-1][j] + GAP_PENALTY
                }

                if (matrix[i][j-1] + GAP_PENALTY > cellMax) {
                    cellMax = matrix[i][j-1] + GAP_PENALTY
                }

                matrix[i][j] = cellMax
            }
        }
        console.log(matrix[matrix.length-1][matrix[matrix.length-1].length-1] * -1)

        return matrix[matrix.length-1][matrix[matrix.length-1].length-1] * -1
    }

    offsetPenalty(event1, event2, MAX_OFFSET_PENALTY) {
        if (event1 === undefined || event2 === undefined) return MAX_OFFSET_PENALTY

        event1 = event1[' t']
        event2 = event2[' t']

        return MAX_OFFSET_PENALTY * (Math.abs(event1 - event2) / Math.max(event1, event2))
    }
    

    getMaxInArray(arr) {
        let max = Number.MIN_VALUE;
        arr.forEach(num => {
            if (num > max) {
                max = num;
            }
        });
        return max;
    }

    getSimulationDistanceBySum(correlatingEventDistances) {
        let sum = 0;
        correlatingEventDistances.forEach(distance => {
            sum += distance;
        });
        return sum;
    }

    // returns array of distances of correlating sets of points
    getHausdorffDistances(events1, events2) {
        let smallEvents = events1
        let largeEvents = events2
        const valueSelector = d => d[' t']
        let smallEventsDistances = this.getEventsDistance(smallEvents, largeEvents, valueSelector);
        let largeEventsDistances = this.getEventsDistance(largeEvents, smallEvents, valueSelector);

        let correlatingPointsDistances = [];
        const pairs = []
        for (let i = 0; i < largeEventsDistances.length; i++) {
            let possibleCorrelatingPoint = largeEventsDistances[i];
            if (smallEventsDistances[possibleCorrelatingPoint] == i) {
                let distance = Math.abs(smallEvents[possibleCorrelatingPoint][' t'] - largeEvents[i][' t']);
                correlatingPointsDistances.push(distance);
                pairs.push([possibleCorrelatingPoint, i])
            }
        }
        return [correlatingPointsDistances, pairs];
    }

    // returns array of indexes from correlating array of closest event
    getEventsDistance(events1, events2, valueSelector) {
        let correlatingEventDistances = [];
        for (let i = 0; i < events1.length; i++) {
            correlatingEventDistances.push(this.getClosestEventIndex(valueSelector(events1[i]), events2, valueSelector));
        }
        return correlatingEventDistances;
    }

    // returns index of closest event in correlating array
    getClosestEventIndex(value, arr, valueSelector) {
        let minIndex = 0;
        let minValue = Number.MAX_SAFE_INTEGER;



        for (let i = 0; i < arr.length; i++) {
            let difference = Math.abs(value - valueSelector(arr[i]));
            if (difference < minValue) {
                minValue = difference;
                minIndex = i;
            }
        }

        return minIndex;
    }

}
