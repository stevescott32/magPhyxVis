class Scatter {
  constructor() {
    this.circleSize = 1;
    this.highlightScale = 5;

    this.divId = 'scatter';
  }

  setParamVis(paramVis) {
    this.paramVis = paramVis;
  }

  setEventVis(eventVis) {
    this.eventVis = eventVis;
  }

  highlightSimulation(simulation) {
    d3.select(`#${this.divId}`)
      .selectAll(`.group${simulation}`)
      .style('z-index', 1)
      .selectAll('circle')
      .attr('r', () => { return this.circleSize * this.highlightScale; })
      ;
  }

  unhighlightSimulation(simulation) {
    d3.select(`#${this.divId}`)
      .selectAll(`.group${simulation}`)
      .selectAll('circle')
      .attr('r', () => { return this.circleSize; })
      .style('z-index', -1)
      ;
  }

  init(data) {
    this.data = data;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        data[i][j]['parentIndex'] = i;
        data[i][j].index = i;
      }
    }

    // set up the axes for the scatterplot
    let xscale = d3.scaleLinear()
      .domain([
        d3.min(data, (file) => {
          return d3.min(file, (row => {
            return +row[' theta'];
          }))
        }),
        d3.max(data, (file) => {
          return d3.max(file, (row => {
            return +row[' theta'];
          }))
        })
      ])
      .range([visConfig.padding.left, visConfig.width + visConfig.padding.left])
      ;

    let yscale = d3.scaleLinear()
      .domain([
        d3.max(data, (file) => {
          return d3.max(file, (row => {
            return +row[' phi'];
          }))
        }),
        d3.min(data, (file) => {
          return d3.min(file, (row => {
            return +row[' phi'];
          }))
        })
      ])
      .range([visConfig.padding.top, visConfig.height + visConfig.padding.top])

    // add an svg to the scatter element
    let svg = d3.select('#scatter')
      .append('svg')
      .attr('width', visConfig.width)
      .attr('height', visConfig.height)
      .append('g')
      // .attr('transform', `translate(${visConfig.padding.left}, ${visConfig.padding.top})`)
      ;

    // finish setting up the axes
    let xaxis = svg.append('g')
      .attr('transform', `translate(0, ${visConfig.padding.top})`)
      ;
    let yaxis = svg.append('g')
      .attr('transform', `translate(${visConfig.padding.left}, 0)`)
      ;

    let topAxis = d3.axisTop()
      .scale(xscale);
    let leftAxis = d3.axisLeft()
      .scale(yscale)
      ;

    xaxis.call(topAxis);
    yaxis.call(leftAxis);

    svg.append('text')
      .attr('x', xscale(0))
      .attr('y', visConfig.padding.top / 2)
      .text('Theta')
      ;
    
    svg.append('g')
      .attr('transform', `rotate(-90)`)
      .append('text')
      .attr('y', visConfig.padding.left / 2)
      .attr('x', -1 * yscale(0))
      .text('Phi')
      ;

    // break the data up into one group per file
    let fileGroups = svg.selectAll('.demo')
      .data(data)
      .enter()
      .append('g')
      .attr('class', (d, i) => { return `fileGroup group${i}`; })
      .attr('groupIndex', (d, i) => {
        d.index = i;
        return i;
      })
      .style('position', 'relative') 
      .style('z-index', -1)
      ;

    // grab references so remapping 'this' doesn't break anything
    let scatterVis = this;
    let paramVis = this.paramVis;
    let eventVis = this.eventVis;

    // add circle everywhere a data point is.
    let circles = fileGroups.selectAll('circle')
      .data((d) => {
        return d;
      })
      .enter()
      .append('circle')
      .attr('cx', (d) => { return xscale(+d[' theta']); })
      .attr('cy', (d) => { return yscale(+d[' phi']); })
      .attr('r', this.circleSize)
      .style('fill', (d) => { return Utils.getFill(d[' event_type']); })
      .on('mouseover', function (d) {
        d3.select(this)
          .attr('r', () => { return scatterVis.circleSize * scatterVis.highlightScale; });
        paramVis.highlightSimulation(d.index);
        eventVis.highlightSimulation(d.index);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .attr('r', () => { return scatterVis.circleSize; });
        paramVis.unhighlightSimulation(d.index);
        eventVis.unhighlightSimulation(d.index);
      })
      .on('click', function (d) {
        console.log('clicked', d);
        selectedPoints.push(d);
      })
      ;

    let eventTypes = ['collision', 'beta = 0', 'pr = 0', 'pphi = 0', 'ptheta = 0'];

    // add the event type selection boxes
    d3.select('#event-groups')
      .append('form')
      .selectAll('input')
      .data(eventTypes)
      .enter()
      .append('g')
      .attr('class', 'checkboxes')
      ;

    d3.selectAll('.checkboxes')
      .append('input')
      .attr('type', 'radio')
      .attr('name', 'event-type')
      .attr('value', (d) => { return d; })
      .text(d => { return `${d}`; })
      .on('click', (type) => {
        console.log('type', type);
        let filteredData = data.map((d) => {
          return d.filter(d => {
            return d[' event_type'] == type;
          })
        })
        eventTypeVis.update(filteredData);
      })
      ;

    d3.selectAll('.checkboxes')
      .append('label')
      .text(d => { return `${d}`; })
      ;


    d3.selectAll('.checkboxes')
      .append('br')
      ;

  }
}
