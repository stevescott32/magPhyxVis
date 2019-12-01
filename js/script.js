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

let genVisConfig = {
  width: 800,
  height: 20,
  padding: {
    left: 30,
    top: 50,
    bottom: 30,
    right: 5
  }
};

const NUM_FILES = 100;
let selectedPoints = [];

let eventTypeVis = new EventTypeVis(NUM_FILES);
let paramVis = new ParamsVis();
let scatter = new Scatter();
  
// let each vis know about the other event vis
scatter.setParamVis(paramVis);
scatter.setEventVis(eventTypeVis);
paramVis.setScatter(scatter);
paramVis.setEventVis(eventTypeVis);
eventTypeVis.setParamVis(paramVis);
eventTypeVis.setScatterVis(scatter);

let simulationOrder = [];
for (let i = 0; i < NUM_FILES; i++) {
  simulationOrder.push(i);
}

// promise the param data
let paramDataPromises = [];
for (let i = 1; i <= NUM_FILES; i++) {
  paramDataPromises.push(d3.csv(`data/commands/commands${('0' + i).slice(-2)}.csv`));
}

// load the param data
Promise.all([...paramDataPromises]).then((paramData) => {
  paramVis.init(paramData, simulationOrder);
});

// promise the event data
let dataPromises = [];
for (let i = 0; i <= NUM_FILES; i++) {
  dataPromises.push(d3.csv(`data/events/events${('0' + i).slice(-2)}.csv`))
}

// load the event data
let dataPromise = Promise.all([...dataPromises]).then(function (data) {
  scatter.init(data);
}).catch(function (err) { })

function clearPrevVis() {
  let previous = document.getElementById("generated-vis");
  while (previous.firstChild) {
    previous.removeChild(previous.firstChild);
  }
}

function clearSelected() {
  console.log('Clearing selected points');
  selectedPoints = [];
  clearPrevVis();
}

function genVis() {
  console.log('Generating vis for selected points', selectedPoints);
  clearPrevVis();
  let groups = [];
  for (let i = 0; i < NUM_FILES; i++) {
    groups.push(selectedPoints.filter(function (d) {
      return d.parentIndex == i;
    }))
  }
  console.log('Groups', groups);
  let visGroup = d3.select('#generated-vis')
    .selectAll('.visGroup')
    .data(groups)
    .enter()
    .append('svg')
    .attr('width', genVisConfig.width)
    .attr('height', genVisConfig.height)
    .append('g')
    .attr('class', 'visGroup')
    ;


  visGroup.selectAll('circle')
    .data((d) => { return d; })
    .enter()
    .append('circle')
    .attr('cx', (d) => { return +d[' t']; })
    .attr('cy', genVisConfig.height / 2)
    .attr('r', 5)
    .style('fill', (d) => {
      return 'black'; // getFill(d[' event_type']);
    })
    .on('mouseover', function (d) {
      d3.select(this)
        .attr('r', 10);
    })
    .on('mouseout', function (d) {
      d3.select(this)
        .attr('r', 5);
    })
    .on('click', function (d) {
      console.log('clicked', d);
      selectedPoints.push(d);
    })
    ;
}
