class ParamsVis {
  constructor() {
    this.circleSize = 2;
    this.config = {
      width: 400,
      height: 400,
      padding: {
        left: 30,
        top: 50,
        bottom: 30,
        right: 5
      }
    };
  }

  init() {
    // load numFiles as promises
    const NUM_FILES = 100;
    let dataPromises = [];
    for (let i = 1; i <= NUM_FILES; i++) {
      // dataPromises.push(d3.csv(`data/commands/command${i}.csv`))
      dataPromises.push(d3.csv(`data/commands/commands${('0' + i).slice(-2)}.csv`, function (csv) {
        csv.forEach(function (row) {
          console.log(Object.keys(row));
        })
      }))
    }

    let myConfig = this.config;

    // load the demo
    Promise.all([...dataPromises]).then((data) => {
      console.log('Data', data);
      // split each of the command arguments
      let derived = data.map(function (d) {
        let split = d['columns'][0].split(' ');
        return {
          theta: split[9],
          beta: split[10]
        }
      })
      console.log('derived', derived);

      // set up the axes for the param vis
      let xscale = d3.scaleLinear()
        .domain([
          d3.min(derived, (d) => {
              return +d.theta;
          }),
          d3.max(derived, (d) => {
            return +d.theta;
          })
        ])
        .range([this.config.padding.left, this.config.width - this.config.padding.right])
        ;

      let yscale = d3.scaleLinear()
        .domain([
          d3.min(derived, (d) => {
              return +d.beta;
          }),
          d3.max(derived, (d) => {
            return +d.beta;
          })
        ])
        .range([this.config.padding.left, this.config.width - this.config.padding.right])
        ;

      let displaySvg = d3.select('#param-vis')
        .append('svg')
        .attr('width', myConfig.width)
        .attr('height', myConfig.height)

      let params = displaySvg.selectAll('circle')
        .data(derived)
        .enter()
        .append('circle')
        .attr('cx', d => {
          return xscale(+d.theta);
        })
        .attr('cy', d => {
          return yscale(+d.beta);
        })
        .attr('r', '5')
        .style('fill', 'blue')
        ;

    });
  }
}
