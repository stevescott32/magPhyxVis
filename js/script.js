let visConfig = {
  width: 1200,
  height: 600,
  padding: {
    left: 100,
    top: 80,
    bottom: 30,
    right: 5
  }
};

let genVisConfig = {
  width: 800,
  height: 20,
  padding: {
    left: 100,
    top: 80,
    bottom: 30,
    right: 5
  }
};
console.log('Starting script');

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

let dontReorder = false;
let dataset = 'data6';

/*
function reorderData(data, order) {
  if(dontReorder) return data;
  let orderedData = [];
  for(let i = 0; i < NUM_FILES; i++) {
    for(let j = 0; j < NUM_FILES; j++) {
      if(order[i] && order[i]['Id'] && order[i]['Id'] == j) {
        orderedData.push(data[j]);
      }
    }
  }
  return orderedData;
}
// */

function getDimensions(dataElement) {
  let command = dataElement['columns'][0];
  let split = command.split(' ');

  let value = {
    theta: +split[9],
    beta: +split[10],
  }
  dims = [];
  dims.push(value.theta.toFixed(5));
  dims.push(value.beta.toFixed(5));
  return dims;
}

function reorderData(data) {
  if(dontReorder) return data;

  let points = [];
  for(let i = 0; i < data.length; i++) {
    points.push(new Point(getDimensions(data[i]), data[i]));
  }

  points = filterPoints(points, 0.0005);
  let boundary = new Boundary([-0.06, 0.05], [-0.05, 0.06]);
  let ktree = new KTree(boundary, 1);
  for(let i = 0; i < points.length; i++) {
    ktree.insertPoint(points[i]);
  }
  // */
  let orderedData = [];
  ktree.setTraverseList();

  for(let i = 0; i < ktree.traverseList.length; i++) {
    orderedData.push(ktree.traverseList[i].data);
  }
  console.log('Data successfully reordered', orderedData);
  return orderedData;
}

// promise the param data
let paramDataPromises = [];
// for (let i = NUM_FILES - 1; i >= 0; i--) {
for (let i = 0; i < NUM_FILES; i++) {
  paramDataPromises.push(d3.csv(`data/${dataset}/commands/commands${('0' + i).slice(-2)}.csv`));
}
// paramDataPromises.push(d3.csv(`data/${dataset}/commands/zorder.csv`));

// load the param data
Promise.all([...paramDataPromises]).then((paramData) => {
  console.log('paramData', paramData);
  // let zorder = paramData.pop();
  // console.log('zorder', zorder);
  let orderedData = reorderData(paramData);
  console.log('ordered param data', orderedData);
  paramVis.init(orderedData);
});

// promise the event data
let dataPromises = [];
for (let i = 0; i <= NUM_FILES; i++) {
  dataPromises.push(d3.csv(`data/${dataset}/events/events${('0' + i).slice(-2)}.csv`))
}
// dataPromises.push(d3.csv(`data/${dataset}/commands/zorder.csv`));

// load the event data
let dataPromise = Promise.all([...dataPromises]).then(function (data) {
  // let zorder = data.pop();
  // console.log('Event data: ', data);
  // let orderedData = reorderData(data);
  let orderedData = data;
  // console.log('Ordered event data: ', orderedData);
  scatter.init(orderedData);

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

// */