class EventTypeVis {
    constructor(numEvents) {
        this.circleSize = 2;
        this.config = {
            width: 1200,
            height: (this.circleSize) * numEvents,
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
        d3.selectAll('.event-type-vis').remove();

        let timeScale = d3.scaleLinear()
          .domain(
              [0, d3.max(data, (sim) => {
                      // console.log('d outside', sim);
                  return d3.max(sim, (d) => {
                      // console.log('d inside', d[' t']);
                      return d[' t'];
                  })
              })]
          )
          .range([0, this.config.width])
          ;

        this.svg = d3.select('#event-type-vis')
            .append('svg')
            .attr('class', 'event-type-vis')
            .attr('id', 'event-type-svg')
            .attr('width', () => { return this.config.width; })
            .attr('height', () => { return this.config.height; })
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
            .attr('cx', d => { 
                // console.log('d for cx', d[' t']);
                return timeScale( +d[' t']); 
            })
            .attr('cy', d => { return this.config.padding.top + d.parentIndex * 2; })
            .attr('r', d => { return this.circleSize; })
            .style('fill', d => {
                return Utils.getFill(d[' event_type']);
            })
            .on('mouseover', function (d) {
                d3.select(this)
                  .attr('r', 8);
              })
              .on('mouseout', function (d) {
                d3.select(this)
                  .attr('r', d => { return this.circleSize; });
              })
              .on('click', function (d) {
                console.log('clicked', d);
                selectedPoints.push(d);
              })
            ;
    }
}
