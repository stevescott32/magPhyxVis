
// load the demo
d3.csv('data/demo3.csv').then(function(data) {
  console.log('Data', data);
  let timeScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => {
        return d['t'];
      })])
      .range([0, 100])
      ;
});
