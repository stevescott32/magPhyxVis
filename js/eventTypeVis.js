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
            }
        };

        this.divId = 'event-type-vis';
    }

    setParamVis(paramVis) {
        this.paramVis = paramVis;
    }

    setScatterVis(scatter) {
        this.scatter = scatter;
    }

    highlightSimulation(simulation) {
        d3.select(`#${this.divId}`)
            .selectAll(`.group${simulation}`)
            .style('z-index', 1)
            .selectAll('circle')
            .attr('r', () => { return this.circleSize * this.highlightScale; })
            .classed('event-highlighted', true)
            ;
    }

    unhighlightSimulation(simulation) {
        d3.select(`#${this.divId}`)
            .selectAll(`.group${simulation}`)
            .selectAll('circle')
            .attr('r', () => { return this.circleSize; })
            .style('z-index', -1)
            .classed('event-highlighted', false)
            ;
    }

    // update the event type vis with the new data
    update(data) {
        if (null == data) { return; }
        d3.selectAll('.event-type-vis').remove();

        console.log('unfiltered data', data);
        let logs = 0;
        for(let i = 0; i < data.length; i++) {
            data[i] = data[i].filter(d => {
                if(logs++ < 10) {
                    console.log('d.t', +d[' t']);
                }
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

        this.svg = d3.select(`#${this.divId}`)
            .append('svg')
            .attr('class', 'event-type-vis')
            .attr('id', 'event-type-svg')
            .attr('width', () => { return this.config.width + this.config.padding.left + this.config.padding.right; })
            .attr('height', () => { return this.config.height + this.config.padding.top + this.config.padding.bottom; })
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
            .data(d => { return d; })
            .enter()
            .append('circle')
            .attr('cx', d => { return timeScale(+d[' t']); })
            .attr('cy', d => { return this.config.padding.top + d.parentIndex * this.circleSize * 2; })
            .attr('r', d => { return this.circleSize; })
            .style('fill', d => {
                if(+d[' t'] > 50) { return 'white'; }
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
            .on('click', function (d) {
                console.log('clicked', d);
                selectedPoints.push(d);
            })
            ;
    }
}
