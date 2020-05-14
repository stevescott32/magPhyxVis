/**
 * Class for a vis displaying a scatter plot of all events
 */
class Scatter {
  constructor() {
    this.circleSize = 1;
    this.highlightScale = 5;

    this.divId = 'scatter';
    this.visConfig = {
      width: 1200,
      height: 600,
      padding: {
        left: 100,
        top: 80,
        bottom: 30,
        right: 5
      }
    };
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
            return +row['t'];
          }))
        }),
        d3.max(data, (file) => {
          return d3.max(file, (row => {
            return +row['t'];
          }))
        })
      ])
      .range([this.visConfig.padding.left, this.visConfig.width + this.visConfig.padding.left])
      ;

    let yscale = d3.scaleLinear()
      .domain([
        d3.max(data, (file) => {
          return d3.max(file, (row => {
            return +row['close-price'];
          }))
        }),
        d3.min(data, (file) => {
          return d3.min(file, (row => {
            return +row['close-price'];
          }))
        })
      ])
      .range([this.visConfig.padding.top, this.visConfig.height + this.visConfig.padding.top])

    // add an svg to the scatter element
    let svg = d3.select('#scatter')
      .append('svg')
      .attr('width', this.visConfig.width + this.visConfig.padding.left + this.visConfig.padding.right)
      .attr('height', this.visConfig.height + this.visConfig.padding.bottom + this.visConfig.padding.top)
      .append('g')
      // .attr('transform', `translate(${this.visConfig.padding.left}, ${this.visConfig.padding.top})`)
      ;

    // finish setting up the axes
    let xaxis = svg.append('g')
      .attr('transform', `translate(0, ${this.visConfig.padding.top})`)
      ;
    let yaxis = svg.append('g')
      .attr('transform', `translate(${this.visConfig.padding.left}, 0)`)
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
      .attr('y', this.visConfig.padding.top / 2)
      .text('Theta')
      ;
    
    svg.append('g')
      .attr('transform', `rotate(-90)`)
      .append('text')
      .attr('y', this.visConfig.padding.left / 2)
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

    // add a circle for every event 
    let circles = fileGroups.selectAll('circle')
      .data((d) => {
        return d;
      })
      .enter()
      .append('circle')
      .attr('cx', (d) => { return xscale(+d['t']); })
      .attr('cy', (d) => { return yscale(+d['close-price']); })
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
  }
}
