let eventTypeVisInstance = null;

/**
 * Class for the vis containing a timeline chart for the selected
 * event type
 */
class EventTypeVis {
    constructor(keyboard) {
        console.log('This in the constructor ', this);
        eventTypeVisInstance = this;
        this.circleSize = 2;
        this.highlightScale = 2;

        this.config = {
            tooltip: d3.select("body")
                .append("div")
                .text("")
                .attr("id", "tooltip")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("background-color", "#ededed")
                .style("padding", "3px")
                .style("border-radius", "3px")
                ,
            tooltipSimIndex: d3.select("#tooltip")
                .append("p")
                .text("")
                .style("margin", "0"),
            tooltipTime: d3.select("#tooltip")
                .append("p")
                .text("")
                .style("margin", "0"),
            tooltipEventType: d3.select("#tooltip")
                .append("p")
                .text("")
                .style("margin", "0"),
            tooltipSimScore: d3.select("#tooltip")
                .append("p")
                .text("")
                .style("margin", "0"),
            tooltipCharacter: d3.select("#tooltip")
                .append("p")
                .text("")
                .style("margin", "0"),
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
            maxDeaths: 0,
            selectedSimIndex: 0,
            data: null
        }

        this.divId = 'event-type-vis';

        this.registerHeaderEvents();

        // store the index of the most recently selected simulation
        this.selectedSimIndex = 0;
        // pressing the arrow up key moves the selected simulation up
        keyboard.registerHandler('ArrowUp', this.shiftSimUp);
        // pressing the arrow down key moves the selected simulation down
        keyboard.registerHandler('ArrowDown', this.shiftSimDown);
    }

    /**
     * Shift the selected simulation up one index
     * Side effects: changes the order of simulations in state.data
     *   and changes the selectedSimIndex
     */
    shiftSimUp() {
        let self = eventTypeVisInstance;
        let index = self.state.selectedSimIndex;
        let data = self.state.data;

        if(index > 0 && data != null) {
            let swap = data.simulations[index];
            data.simulations[index] = data.simulations[index - 1];
            data.simulations[index - 1] = swap;
            self.state.selectedSimIndex = index - 1;
            self.update(data);
        }
    }

    /**
     * Shift the selected simulation down one index
     * Side effects: changes the order of simulations in state.data
     *   and changes the selectedSimIndex
     */
    shiftSimDown() {
        let self = eventTypeVisInstance;
        let index = self.state.selectedSimIndex;
        let data = self.state.data;

        if(data != null && index < data.simulations.length) {
            let swap = data.simulations[index];
            data.simulations[index] = data.simulations[index + 1];
            data.simulations[index + 1] = swap;
            self.state.selectedSimIndex = index + 1;
            self.update(data);
        }
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

    selectedSimClass = 'selected-sim';
    /**
     * This method should be called when the user clicks on a simulation
     * @param {Number} simIndex the index of the simulation to select
     */
    selectSim(simIndex) {
        this.state.selectedSimIndex = simIndex;
        this.state.data.simulations[simIndex].selected = true;
        d3.select(`#${this.divId}`)
            .selectAll(`.group${simIndex}`)
            .selectAll('circle')
            .classed(this.selectedSimClass, true)
            ;
    }

    /**
     * Unselect a simulation 
     * @param {Number} simIndex the index of the simulation to select
     */
    unselectSim(simIndex) {
        this.state.data.simulations[simIndex].selected = false;
        d3.select(`#${this.divId}`)
            .selectAll(`.group${simIndex}`)
            .selectAll('circle')
            .classed(this.selectedSimClass, false)
            ;
    }

    /**
     * Unselect all the selected simulations
     */
    unselectAllSims() {
        d3.selectAll(`.${this.selectedSimClass}`)
            .classed(this.selectedSimClass, false)
            ;
    }

    highlightSimulation(simIndex) {
        d3.select(`#${this.divId}`)
            .selectAll(`.group${simIndex}`)
            .selectAll('circle')
            // .attr('r', () => { return this.circleSize * this.highlightScale; })
            .classed('event-highlighted', true)
            ;
    }

    unhighlightSimulation(simIndex) {
        d3.select(`#${this.divId}`)
            .selectAll(`.group${simIndex}`)
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
            self.state.data = data;

            this.diffMin = 0; // d3.min(distances);
            this.diffMax = 20; // d3.max(distances) + this.config.tolerance;
            this.originalData = JSON.parse(JSON.stringify(data));

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

            // have a time slider to filter events outside of the time range
            $(".time-range-2").slider({
                min: range[0],
                max: range[1],
                values: range,
                slide: function (event, ui) {
                    $(".amount").html("From " + ui.values[0] + " to " + ui.values[1]);
                    console.log('sliding')
                    self.config.timeRange = ui.values;
                    data = self.getTimeFilteredData(data);
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

        const eventA = eventAIdx !== -1 ? data[eventAIdx].events : []
        const eventB = eventBIdx !== -1 ? data[eventBIdx].events : []
        let arrowInfo = []
        if (this.state.ordering === 'dtw') {
            const dtw = getDTWDistanceWithDeaths(eventA, eventB, d => d.t, this.state.maxDeaths)
            arrowInfo = buildMatchingEvents(dtw, eventA, eventB, this.state.maxDeaths, d => d.t)
                .pairs
                .map(d => [d.a, d.b])
        } else if (this.state.ordering === 'hausdorff') {
            if (this.state.matchExact) {
                arrowInfo = simulationDistance.getHausdorffDistances(eventA, eventB)[1]
            } else {
                arrowInfo = simulationDistance.getEventsDistance(eventA, eventB, d => d.t).map((d, i) => [i, d])
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
                const sourceX = timeScale(eventA[d[0]].t);
                const sourceY = eventCountScale(eventAIdx)
                const targetX = timeScale(eventB[d[1]].t)
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
        return d3.scaleLinear()
            .domain([0, data.simulations.length])
            .range([this.config.padding.top, this.config.height + this.config.padding.top])
            ;
    }

    getTimeRange(data) {
        let sims = data.simulations;
        const min = d3.min(sims, (sim) => {
            // TODO i think this should be min(sim.events)
            return d3.min(sim.events, (event) => {
                return event.t;
            })
        })
        const max = d3.max(data.simulations, (sim) => {
            return d3.max(sim.events, (event) => {
                return event.t;
            })
        })
        return [parseFloat(min), parseFloat(max)]
    }

    getTimeScale(data) {
        return d3.scaleLinear()
            .domain(this.getTimeRange(data))
            .range([this.config.padding.left, this.config.width + this.config.padding.left])
    }

    getTimeFilteredData(data) {
        for (let s = 0; s < data.simulations.length; s++) {
            for (let e = 0; e < data.simulations[s].events.length; e++) {
                let event = data.simulations[s].events[e];
                event.on = event.eventTypeOn && event.t > this.config.timeRange[0] && event.t < this.config.timeRange[1];
            }
        }
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
                return `oneSimulation group${d.meta.simulationIndex}`;
            })

        simsSel.exit().remove();

        let paramVis = this.paramVis;
        let scatter = this.scatter;

        // append a circle for every event in the vis
        const circleSel = sims.selectAll('circle')
            .data((d, i) => {
                for (let a = 0; a < d.events.length; a++) {
                    d.events[a].simulationIndex = i;
                }
                return d.events;
            });

        circleSel.exit().remove();

        circleSel
            .enter()
            .append('circle')
            .merge(circleSel)
            .attr('time', d => { return d.t; })
            .attr('simulationIndex', d => { return d.simulationIndex; })
            .attr('class', 'eventTimelinePoint')
            .attr('cx', d => { return timeScale(+d.t); })
            .attr('cy', d => { return eventCountScale(d.simulationIndex); })
            .attr('r', d => { 
                if(d.on) {
                    return this.circleSize; 
                }
                return 0; // events that are turned off should not display
            })
            .style('fill', d => { return data.getColor(d); })
            .classed('selected-sim', (d) => { return d.selected; })
            .on("mousemove", function(){return self.config.tooltip.style("top", (event.pageY-150)+"px").style("left",(event.pageX+5)+"px");})
            .on('mouseover', function (d, index) {
                if (d.on) {
                    if (self.state.match) {
                        self.state.match.hover = d.simulationIndex
                        self.highlightSimulation(d.simulationIndex)
                    }
                    scatter.highlightSimulation(d.index);
                    paramVis.highlightSimulation(d.index);
                    d3.select(this)
                        .attr('r', () => { return self.circleSize * self.highlightScale; });
                }
                self.config.tooltipSimIndex.text(`Simulation: ${d.simulationIndex}`);
                self.config.tooltipTime.text(`Time: ${d.t}`);
                self.config.tooltipSimScore.text(`Simulation Score: ${data.simulations[d.simulationIndex].meta.distance}`);
                self.config.tooltipEventType.text(`EventType: ${d.event_type}`)
                self.config.tooltip.style("visibility", "visible");
                let character = "";
                if (d.event_type !== "RUN") character = d.added !== "" ? `add: ${d.added}` : `del: ${d.removed}`;
                self.config.tooltipCharacter.text(character);
                d3.selectAll("#input-child").remove();
                d3.selectAll("#delete-child").remove();
                const addition = d3.select("#input");
                const deletion = d3.select("#delete");
                data.simulations[d.simulationIndex].events.forEach((event, i) => {
                    if (event.added && event.added !== "") {
                        if (i === index) {
                            addition
                                .append("p")
                                .text(event.added)
                                .attr("class", "inline-block")
                                .attr("id", "input-child")
                                .attr("class", "dark-green")
                                ;
                        }
                        else {
                            addition
                                .append("p")
                                .text(event.added)
                                .attr("class", "inline-block")
                                .attr("class", "green")
                                .attr("id", "input-child")
                                ;
                        }
                        deletion
                            .append("p")
                            .text("*")
                            .attr("class", "inline-block")
                            .attr("id", "delete-child")
                            ;
                    } else if (event.removed && event.removed !== "") {
                        if (i === index) {
                            deletion
                                .append("p")
                                .text(event.removed)
                                .attr("class", "inline-block")
                                .attr("id", "delete-child")
                                .attr("class", "dark-red")
                                ;
                        }
                        else {
                            deletion
                                .append("p")
                                .text(event.removed)
                                .attr("class", "inline-block")
                                .attr("id", "delete-child")
                                .attr("class", "red")
                                ;
                        }
                        addition
                            .append("p")
                            .text("*")
                            .attr("class", "inline-block")
                            .attr("id", "input-child")
                            ;
                    }
                });


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
                self.config.tooltip.style("visibility", "hidden")
            })
            .on('click', function (d, i) {
                console.log('Clicked event', d);
                // self.unselectAllSims();
                self.selectSim(d.simulationIndex);

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
