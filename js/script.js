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

Promise.all([
  d3.csv("data/demo1.csv"),
  d3.csv("data/demo2.csv"),
  d3.csv("data/demo3.csv"),
  d3.csv("data/demo4.csv"),
  d3.csv("data/demo5.csv"),
]).then(function (data) {
  // load the demo
  // d3.csv('data/demo3.csv').then(function (data) {
  console.log('Data', data);
  let timeScale = d3.scaleLinear()
    .domain([0, d3.max(data, (file) => {
      // console.log('file', file);
      return d3.max(file, (row) => {
        return parseFloat(row['t']);
      })
    })])
    .range([visConfig.padding.left, visConfig.width - visConfig.padding.right])
    ;


  let allMax = d3.max(data, (file) => {
    console.log('file', file);
    return d3.max(file, (row) => {
      return parseFloat(row['t']);
    })
  });
  console.log('All max', allMax);


  let svg = d3.select('body')
    .append('svg')
    .attr('width', visConfig.width)
    .attr('height', visConfig.height)

  let axis = svg.append('g')
    .attr('transform', `translate(${visConfig.padding.left}, ${visConfig.height - visConfig.padding.bottom})`)
    ;

  let bottomAxis = d3.axisBottom()
    .scale(timeScale);

  axis.call(bottomAxis);

  let demoGroups = svg.selectAll('.demo')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'demo')
    .attr('transform', (d, i) => {
      return `translate(${visConfig.padding.left}, ${visConfig.height - (i + 1) * 50})`;
    })
    ;

    demoGroups.selectAll('circle')
    .data((d, i) => {
      console.log('Another d', d);
      return d;
    })
    .enter()
    .append('circle')
    .attr('cx', (d) => {
      return timeScale(parseFloat(d['t']));
    })
    .attr('cy', -50)
    .attr('r', 3)
    .style('fill', (d) => {
      switch (d['event type']) {
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

}).catch(function (err) {
  // handle error here
})
