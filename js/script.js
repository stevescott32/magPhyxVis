let visConfig = {
  width: 800,
  height: 400,
  padding: {
    left: 30,
    top: 50,
    bottom: 30,
    right: 5
  }
};


// load the demo
d3.csv('data/demo3.csv').then(function (data) {
  console.log('Data', data);
  let timeScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => {
      return parseFloat(d['t']);
    })])
    .range([visConfig.padding.left, visConfig.width - visConfig.padding.right])
    ;

  let axis = d3.select('body')
    .append('svg')
    .attr('width', visConfig.width)
    .attr('height', visConfig.height)
    .append('g')
    .attr('transform', `translate(${visConfig.padding.left}, ${visConfig.height - visConfig.padding.bottom})`)
    ;

  let bottomAxis = d3.axisBottom()
    .scale(timeScale);

  axis.call(bottomAxis);

    axis.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d) => {
      return timeScale(parseFloat(d['t']));
    })
    .attr('cy', -50)
    .attr('r', 3)
    .style('fill', (d) => {
      switch(d['event type']) {
        case 'init': 
          return 'red';
        case 'collision':
          return 'green';
        case 'beta = 0':
          return 'violet';
        case 'theta = 0':
          return 'brown';
        case 'phi = 0':
          return 'orange';
        case 'pphi = 0':
          return 'purple';
        default:
          return 'black';
      }
    })
    ;

});
