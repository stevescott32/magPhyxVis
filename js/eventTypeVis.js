class EventTypeVis {
    constructor(numEvents) {
        this.circleSize = 2;
        this.highlightScale = 2;

        this.config = {
            width: 1200,
            height: (this.circleSize * 2) * numEvents,
            padding: {
                left: 5,
                top: 5,
                bottom: 5,
                right: 5
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

    update(data) {
        if (null == data) { return; }
        d3.selectAll('.event-type-vis').remove();

        let timeScale = d3.scaleLinear()
            .domain(
                [0, d3.max(data, (sim) => {
                    return d3.max(sim, (d) => {
                        return d[' t'];
                    })
                })]
            )
            .range([this.config.padding.left, this.config.width])
            ;

        this.svg = d3.select(`#${this.divId}`)
            .append('svg')
            .attr('class', 'event-type-vis')
            .attr('id', 'event-type-svg')
            .attr('width', () => { return this.config.width + this.config.padding.left + this.config.padding.right; })
            .attr('height', () => { return this.config.height + this.config.padding.top + this.config.padding.bottom; })
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

        sims.selectAll('circle')
            .data(d => { return d; })
            .enter()
            .append('circle')
            .attr('cx', d => { return timeScale(+d[' t']); })
            .attr('cy', d => { return this.config.padding.top + d.parentIndex * this.circleSize * 2; })
            .attr('r', d => { return this.circleSize; })
            .style('fill', d => {
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
