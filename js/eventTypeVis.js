/**
 * Class for the vis containing a timeline chart for the selected
 * event type
 */
class EventTypeVis {
    constructor(numEvents) {
        this.circleSize = 2;
        this.highlightScale = 2;

        this.config = {
            width: 150, // 1200,
            height: (this.circleSize * 2) * numEvents,
            padding: {
                left: 80,
                top: 100,
                bottom: 5,
                right: 10
            },
            tolerance: 0.1, // amount to add to the slider max for floating comparison
            stepCount: 30, // how many steps the slider should have
        };

        this.divId = 'event-type-vis';
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

    // creates a slider if it doesn't exist
    createSlider(root, className, title, onSliderClick) {
        let sliderContainer = root.select('div.' + className);
        if (sliderContainer.empty()) {
            sliderContainer = root.append('div').attr('class', className)
            sliderContainer.append('p')
                .text(title)
            sliderContainer.append('input')
                .attr('class', 'eventTypeSlider')
                .attr('type', 'range')
                .on('click', onSliderClick)
        }
        return sliderContainer;
    }

    // methods outside of this class should call this update method,
    // not the update helper
    update(data, paramData, distances) {
        this.diffMin = d3.min(distances);
        this.diffMax = d3.max(distances) + this.config.tolerance;
        this.originalData = [...data];
        this.originalParamData = [...paramData];
        this.originalDistances = [...distances];

        // append a slider
        const sliderContainer = this.createSlider(
            d3.select(`#${this.divId}`),
            'filter-slider-container',
            'Filter Param Distances',
            function() {
                self.updateSlider(this.value)
            }
        )
        const self = this;
        let slider = sliderContainer.select('input')
            .attr('min', this.diffMin)
            .attr('max', this.diffMax)
            .attr('step', ((this.diffMax - this.diffMin) / this.config.stepCount))

        // append a slider
        const minw = 200, maxw = window.innerWidth;
        const widthSliderContainer = this.createSlider(
            d3.select(`#${this.divId}`),
            'width-slider-container',
            'Graph Width',
            function() {
                self.config.width = +this.value;
                self.updateHelper(data, paramData, distances);
            }
        )

        widthSliderContainer.select('input')
            .attr('min', minw)
            .attr('max', maxw)
            .attr('step', 0.1)

        const minh = 200, maxh = window.innerHeight * 10;
        const heightSliderContainer = this.createSlider(
            d3.select(`#${this.divId}`),
            'height-slider-container',
            'Graph Height',
            function() {
                self.config.height = +this.value;
                self.updateHelper(data, paramData, distances);
            }
        )

        heightSliderContainer.select('input')
            .attr('min', minh)
            .attr('max', maxh)
            .attr('step', 0.1)

        this.updateHelper(data, paramData, distances);

    }

    // update the event type vis with the new data
    updateHelper(data, paramData, distances) {
        if (null == data) { return; }
        console.log('distances', distances);

        for (let i = 0; i < data.length; i++) {
            data[i] = data[i].filter(d => {
                return +d[' t'] < 100;
            })
        }

        let timeScale = d3.scaleLinear()
            .domain(
                [0, d3.max(data, (sim) => {
                    return d3.max(sim, (d) => {
                        return d[' t'];
                    })
                })]
            )
            .range([this.config.padding.left, 2 * this.config.width + this.config.padding.left])
            ;

        let eventCountScale = d3.scaleLinear()
            .domain([0, data.length])
            .range([this.config.padding.top, this.config.height + this.config.padding.top])
            ;

        d3.selectAll('.event-type-vis').remove();
        this.svg = d3.select(`#${this.divId}`)
            .append('svg')
            .attr('class', 'event-type-vis')
            .attr('id', 'event-type-svg')
            .attr('width', () => { return this.config.width + this.config.padding.left + this.config.padding.right; })
            .attr('height', () => { return this.config.height + this.config.padding.top + this.config.padding.bottom; })
            ;

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

        let distanceBars = this.svg.selectAll('.distanceBars')
            .data(distances)
            .enter()
            .append('rect')
            .attr('x', (d, i) => {
                return 20 - distanceScale(d);
            })
            .attr('y', (d, i) => { return eventCountScale(i) })
            .attr('width', (d) => {
                return distanceScale(d)
            })
            .attr('height', 1)
            .attr('class', 'distanceBars')
            ;

        let xaxis = this.svg.append('g')
            .attr('transform', `translate(0, ${this.config.padding.left + 10})`)
            ;
        let yaxis = this.svg.append('g')
            .attr('transform', `translate(${this.config.padding.top - 30}, 0)`)
            ;

        let topAxis = d3.axisTop()
            .scale(timeScale);
        let leftAxis = d3.axisLeft()
            .scale(eventCountScale)
            ;

        xaxis.call(topAxis);
        yaxis.call(leftAxis);

        this.svg.append('text')
            .attr('x', timeScale(25))
            .attr('y', this.config.padding.top / 2)
            .text('Time')
            ;

        this.svg.append('g')
            .attr('transform', `rotate(-90)`)
            .append('text')
            .attr('y', this.config.padding.left / 2)
            .attr('x', -1 * eventCountScale(50))
            .text('Simulation')
            ;

        let sims = this.svg.selectAll('.oneSimulation')
            .data(data)
            .enter()
            .append('g')
            .attr('class', (d, i) => { return `oneSimulation group${i}`; })
            ;

        let eventVis = this;
        let paramVis = this.paramVis;
        let scatter = this.scatter;

        // append a circle for every event in the vis
        sims.selectAll('circle')
            .data((d, i) => {
                data = d;
                for (let a = 0; a < data.length; a++) {
                    data[a]['parentIndex'] = i;
                }
                return data;
            })
            .enter()
            .append('circle')
            .attr('simulationIndex', d => { return d.simulationIndex; })
            .attr('class', 'eventTimelinePoint')
            .attr('cx', d => { return timeScale(+d[' t']); })
            .attr('cy', d => { return eventCountScale(d.parentIndex) })
            .attr('r', d => { return this.circleSize; })
            .style('fill', d => {
                if (+d[' t'] > 50) { return 'white'; }
                return Utils.getFill(d[' event_type']);
            })
            .on('mouseover', function (d) {
                d3.select(this)
                    .attr('r', () => { return eventVis.circleSize * eventVis.highlightScale; });
                scatter.highlightSimulation(d.index);
                paramVis.highlightSimulation(d.index);
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .attr('r', () => { return eventVis.circleSize; });
                scatter.unhighlightSimulation(d.index);
                paramVis.unhighlightSimulation(d.index);
            })
            .on('click', function (d, i) {
                // eventVis.updateDimensionComparison(d, paramData);
                eventVis.colorDimsByDistance(d['parentIndex'], paramData);

                let simulationDistances = new SimulationDistance();
                let reorderedDta = simulationDistances.reorder(eventVis.originalData, d3.select(this).attr("simulationIndex"));

                eventVis.update(reorderedDta, eventVis.originalParamData, eventVis.originalDistances);
            })
            ;
    }



    updateSlider(value) {
        let filteredData = [];
        let filteredPamaData = [];
        let filteredDistances = [];
        for (let i = 0; i < this.originalDistances.length; i++) {
            // console.log(`Comparing ${this.originalDistances[i]}`);
            if (this.originalDistances[i] <= value) {
                filteredData.push(this.originalData[i]);
                filteredPamaData.push(this.originalParamData[i]);
                filteredDistances.push(this.originalDistances[i]);
            }
        }
        console.log('Filtered data', filteredData);
        this.updateHelper(filteredData, filteredPamaData, filteredDistances);
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

    reorder(data, simulationIndex, paramData, distances){
        console.log(data);

        let data_sum = [];

        for(let i=0; i<data.length; i++){
            // let sum = this.getSimulationDistanceBySum(this.getCorrelatingEventDistances(data[simulationIndex], data[i]));
            console.log(this.getCorrelatingEventDistances(data[simulationIndex], data[i]));
            let min = this.getMinInArray(this.getCorrelatingEventDistances(data[simulationIndex], data[i]));
            console.log(min);
            data_sum.push({
                "data" : data[i],
                "min" : min
            });
        }

        data_sum.sort((obj1, obj2) => obj1['min'] - obj2['min']);

        console.log(data_sum);

        let reOrderedData = [];
        data_sum.forEach(element => {
            reOrderedData.push(element['data'])
        });

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
        let smallEvents = events1.length < events2.length ? events1 : events2;
        let largeEvents = events1.length > events2.length ? events1 : events2;
        const valueSelector = d => d[' t']
        let smallEventsDistances = this.getEventsDistance(smallEvents, largeEvents, valueSelector);
        let largeEventsDistances = this.getEventsDistance(largeEvents, smallEvents, valueSelector);


        let correlatingPointsDistances = [];
        for (let i=0; i<largeEventsDistances.length; i++){
            let possibleCorrelatingPoint = largeEventsDistances[i];
            if (smallEventsDistances[possibleCorrelatingPoint] == i){
                let distance = Math.abs(smallEvents[possibleCorrelatingPoint][' t'] - largeEvents[i][' t']);
                correlatingPointsDistances.push(distance);
            }
        }
        return correlatingPointsDistances;

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




}
