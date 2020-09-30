/**
 * ParamVis: Class to encapsulate the code for the 
 * parameter visualization.
 */
class ParamsVis {
  constructor() {
    // size for each dot in the vis
    this.circleSize = 5;
    this.highlightScale = 2;

    // define the size of the svg for the param vis and
    // the padding around the vis
    this.config = {
      width: 500,
      height: 400,
      padding: {
        left: 200,
        top: 100,
        bottom: 30,
        right: 15
      }
    };
    // define a base url that the specific params can use to link to the MagPhyx simulation
    // sample url: http://edwardsjohnmartin.github.io/MagPhyx/?initparams=1,0,0,0.721905,-0.0589265,0.0455992
    this.baseUrl = 'http://edwardsjohnmartin.github.io/MagPhyx/?initparams=';

  }

  highlightSimulation(simulation) {
    d3.select(`.group${simulation}`)
      .attr('r', () => { return this.circleSize * this.highlightScale; })
      ;
  }

  unhighlightSimulation(simulation) {
    d3.select(`.group${simulation}`)
      .attr('r', () => { return this.circleSize; })
      ;
  }

  setScatter(scatter) {
    this.scatter = scatter;
  }

  setEventVis(eventVis) {
    this.eventVis = eventVis;
  }

  // given a row number, create a url so the simulation can be replayed in MagPhyx
  getUrlFromCsv(row) {
    // console.log('Why isnt this working', row);
    let split = row.split(' ');
    let result = `${this.baseUrl}${split[6]},${split[7]},${split[8]},${split[9]},${split[10]},${split[11]}`;
    return result;
  }

  /**
   * Init function - initialize the vis, linking the simulations in order
   * @param data - an array containing the data in order 
   * @param boundaries - the boundaries of the k tree to display in the vis
   */
  init(data, boundaries) {
    let myConfig = this.config;
    console.log('Param data', data);

    // create a derived data set that gives each point a reference to the id
    // of the point before it, a url to link to, the correct theta and beta
    // from the command.
    let id = 0;
    let parent = -1;
    let derived = data.map((d) => {
      let value = d;
      value['id'] = id;
      value['parent'] = parent;
      value['command'] = d.originalCommand['columns'][0];
      value['url'] = this.getUrlFromCsv(d.originalCommand['columns'][0]);

      parent = id;
      id++;
      return value;
    })

    // set up the x axis
    let xscale = d3.scaleLinear()
      .domain([
        d3.min(derived, (d) => {
          return d.theta;
        }),
        d3.max(derived, (d) => {
          return d.theta;
        })
      ])
      .range([this.config.padding.left, this.config.width + this.config.padding.left])
      ;

    // set up the y axis
    let yscale = d3.scaleLinear()
      .domain([
        d3.min(derived, (d) => {
          return d.beta;
        }),
        d3.max(derived, (d) => {
          return d.beta;
        })
      ])
      .range([this.config.padding.top, this.config.height + this.config.padding.top])
      ;

    // add a svg for the vis
    let displaySvg = d3.select('#param-vis')
      .append('svg')
      .attr('width', myConfig.width + myConfig.padding.left + myConfig.padding.right)
      .attr('height', myConfig.height + myConfig.padding.top + myConfig.padding.bottom)
      ;


    // add a rectangle around each boundary
    // displaySvg.selectAll('.boundaries')
    //   .data(boundaries)
    //   .enter()
    //   .append('rect')
    //   .attr('x', d => {
    //     return xscale(d.dimensionMins[0]);
    //   })
    //   .attr('y', d => {
    //     return yscale(d.dimensionMins[1]);
    //   })
    //   .attr('width', d => {
    //     return xscale(d.dimensionMaxs[0]) - xscale(d.dimensionMins[0]);
    //   })
    //   .attr('height', d => {
    //     return yscale(d.dimensionMaxs[1]) - yscale(d.dimensionMins[1]);
    //   })
    //   .style('fill', 'white')
    //   .style('stroke-width', 3)
    //   .style('stroke', 'lightgrey')
    //   .attr('class', 'boundaries')
    //   ;

    // draw a line from each point to its parent
    let links = displaySvg.selectAll('.link')
      .data(derived)
      .enter()
      .append('path')
      .attr('d', function (d) {
        let p = derived.filter(dd => {
          return dd.id == d.parent;
        })[0];
        if (undefined == p) {
          return `M ${xscale(d.theta)} ${yscale(d.beta)} L ${xscale(d.theta)} ${yscale(d.beta)}`;
        }
        return `M ${xscale(d.theta)} ${yscale(d.beta)} L ${xscale(p.theta)} ${yscale(p.beta)}`;
      })
      .style('fill', 'red')
      .style('stroke', 'orange')
      .style('stroke-width', '2')
      .attr('id', d => { return d.id; })
      .attr('parent', d => { return d.parent; })
      .attr('class', 'link')
      ;

    let paramVis = this;

    // add circles for every param combo
    let params = displaySvg.selectAll('circle')
      .data(derived)
      .enter()
      .append('circle')
      .attr('cx', d => { return xscale(d.theta); })
      .attr('cy', d => { return yscale(d.beta); })
      .attr('r', () => { return paramVis.circleSize; })
      .attr('class', d => { return `group${d.index}`; })
      .style('fill', 'blue')
      .attr('id', d => { return d.id; })
      .attr('zorder', d => d.zorder)
      .attr('parent', d => { return d.parent; })
      .on('mouseover', function (d) {
        d3.select(this)
          .attr('r', () => {
            return paramVis.circleSize * 1.3;
          })
          ;
        if (null != paramVis.scatter) {
          paramVis.scatter.highlightSimulation(d.index);
          paramVis.eventVis.highlightSimulation(d.index);
        } 
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .attr('r', () => {
            return paramVis.circleSize;
          })
          ;
        if (null != paramVis.scatter) {
          paramVis.scatter.unhighlightSimulation(d.index);
          paramVis.eventVis.unhighlightSimulation(d.index);
        } 
      })
      .on('click', d => {
        // open the magPhyx simulation
        window.open(d.url);
      })
      .append('svg:title')
      .text((d) => d.id)
      ;

    let xaxis = displaySvg.append('g')
      .attr('transform', `translate(0 ${myConfig.padding.top * (3 / 4)})`)
      ;
    let yaxis = displaySvg.append('g')
      .attr('transform', `translate(${myConfig.padding.left * (3 / 4)} 0)`)
      ;

    let topAxis = d3.axisTop()
      .scale(xscale);
    let leftAxis = d3.axisLeft()
      .scale(yscale)
      ;

    xaxis.call(topAxis);
    yaxis.call(leftAxis);

    displaySvg.append('text')
      // .attr('x', xscale(0.0))
      .attr('x', xscale(0))
      .attr('y', myConfig.padding.top / 2)
      .text('Theta')
      ;

    displaySvg.append('g')
      .attr('transform', `rotate(-90)`)
      .append('text')
      .attr('y', myConfig.padding.left / 2)
      .attr('x', -1 * yscale(0))
      .text('Beta')
      ;
  }
}
