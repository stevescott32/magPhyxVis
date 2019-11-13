class EventTypeVis {
    constructor() {
        this.config = {
            width: 500,
            height: 500,
            padding: {
                left: 30,
                top: 50,
                bottom: 30,
                right: 5
            }
        };
    }

    update(data) {
        if (null == data) { return; }
        console.log('handling event group click', data);
        let previous = document.getElementById("event-type-svg");
        while (null != previous && previous.firstChild) {
            previous.removeChild(previous.firstChild);
        }


        this.svg = d3.select('#event-type-vis')
            .select('svg')
            .attr('class', 'myClass')
            .attr('id', 'event-type-svg')
            ;

        let sims = this.svg.selectAll('.oneSimulation')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'oneSimulation')
            ;

        sims.selectAll('circle')
            .data(d => { return d; })
            .enter()
            .append('circle')
            .attr('cx', d => { return d[' t']; })
            .attr('cy', d => { return this.config.padding.top + d.parentIndex * 30; })
            .attr('r', '2')
            .style('fill', d => {
                return Utils.getFill(d[' event_type']);
            })
            ;
    }
}
