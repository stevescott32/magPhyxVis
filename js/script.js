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
}

const NUM_FILES = 10;
let selectedPoints = [];

// load numFiles as promises
let dataPromises = [];
for (let i = 0; i < NUM_FILES; i++) {
  dataPromises.push(d3.csv(`data/events${i}.csv`))
}

// load the demo
Promise.all([...dataPromises]).then(function (data) {
  console.log('Data.length', data.length);
  for(let i = 0; i < data.length; i++) {
    for(let j = 0; j < data[i].length; j++) {
      data[i][j]['parentIndex'] = i;
    }
  }

  // set up the axes
  let xscale = d3.scaleLinear()
    .domain([
      d3.min(data, (file) => {
        return d3.min(file, (row => {
          return parseFloat(row[' theta']);
        }))
      }),
      d3.max(data, (file) => {
        return d3.max(file, (row => {
          return parseFloat(row[' theta']);
        }))
      })
    ])
    .range([visConfig.padding.left, visConfig.width - visConfig.padding.right])
    ;
  let yscale = d3.scaleLinear()
    .domain([
      d3.max(data, (file) => {
        return d3.max(file, (row => {
          return parseFloat(row[' phi']);
        }))
      }),
      d3.min(data, (file) => {
        return d3.min(file, (row => {
          return parseFloat(row[' phi']);
        }))
      })
    ])
    .range([visConfig.padding.bottom, visConfig.height - visConfig.padding.top])

  let svg = d3.select('#scatter')
    .append('svg')
    .attr('width', visConfig.width)
    .attr('height', visConfig.height)
    .append('g')
    .attr('transform', `translate(${visConfig.padding.left}, ${visConfig.padding.top})`)
    ;

  let xaxis = svg.append('g');
  let yaxis = svg.append('g');

  let bottomAxis = d3.axisBottom()
    .scale(xscale);
  let leftAxis = d3.axisLeft()
    .scale(yscale);

  xaxis.call(bottomAxis);
  yaxis.call(leftAxis);

  let fileGroups = svg.selectAll('.demo')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'fileGroup')
    .attr('groupIndex', (d, i) => {
      d.index = i;
      return i;
    })
    ;

    let logs = 0;
  // add circle everywhere a data point is
  let scatters = fileGroups.selectAll('circle')
    .data((d) => {
      return d;
    })
    .enter()
    .append('circle')
    .attr('cx', (d) => {
      return xscale(parseFloat(d[' theta']));
    })
    .attr('cy', (d) => {
      return yscale(parseFloat(d[' phi']));
    })
    .attr('r', 1)
    .style('fill', (d) => {
      return getFill(d[' event_type']);
    })
    .on('mouseover', function (d) {
      d3.select(this)
        .attr('r', 10);
    })
    .on('mouseout', function (d) {
      d3.select(this)
        .attr('r', 1);
    })
    .on('click', function (d) {
      console.log('clicked', d);
      selectedPoints.push(d);
    })
    ;
}).catch(function (err) { })

function getFill(event_type) {
  switch (event_type) {
    case 'init':
      return 'grey';
    case 'collision':
      return 'red';
    case 'beta = 0':
      return 'purple';
    case 'theta = 0':
      return 'blue';
    case 'pr = 0':
      return 'orange';
    case 'phi = 0':
      return 'green';
    case 'pphi = 0':
      return 'yellow';
    default:
      return 'black';
  }
}

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

/*
let genVisTimeScale = d3.scaleLinear()
  .domain([
    d3.min(data, (row) => {
      return parseFloat(row['t']);
    }),
    d3.max(data, (row) => {
      return parseFloat(row['t']);
    })])
  .range([genVisConfig.padding.left, genVisConfig.width - genVisConfig.padding.right])
  ;
  */

function genVis() {
  console.log('Generating vis for selected points', selectedPoints);
  clearPrevVis();
  let groups = [];
  for(let i = 0; i < NUM_FILES; i++) {
    groups.push(selectedPoints.filter(function(d) {
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
    .attr('cx', (d) => {
      return (parseFloat(d[' t']));
    })
    .attr('cy', genVisConfig.height / 2)
    .attr('r', 5)
    .style('fill', (d) => {
      return getFill(d[' event_type']);
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

  /*
let anotherAxis = d3.axisBottom()
  .scale(genVisTimeScale);

let timeAxis = d3.select('#generated-vis')
  .select('svg')
  .append('g')
  .call(anotherAxis)
  ;
  */

}
