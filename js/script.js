/**
 * This file is the starting point for the program.
 * It loads the data and initializes the visualizations.
 */

console.log('Starting script');

let settings = {
  NUM_FILES: 100, // change this to vary how many files of events/commands will be used
  reorderData: true, // change this to false to turn off z-ordering
  dataset: 'data7' // change this to use a different data set
}
let eventTypeVis = new EventTypeVis(settings.NUM_FILES);
let paramVis = new ParamsVis();
let scatter = new Scatter();
  
// let each vis know about the other event vis
scatter.setParamVis(paramVis);
scatter.setEventVis(eventTypeVis);
paramVis.setScatter(scatter);
paramVis.setEventVis(eventTypeVis);
eventTypeVis.setParamVis(paramVis);
eventTypeVis.setScatterVis(scatter);

// create promises so all data can load asynchronous
// promise the param data
let paramDataPromises = [];
for (let i = 0; i < settings.NUM_FILES; i++) {
  paramDataPromises.push(d3.csv(`data/${settings.dataset}/commands/commands${('0' + i).slice(-2)}.csv`));
}

// promise the event data
let dataPromises = [];
for (let i = 0; i <= settings.NUM_FILES; i++) {
  dataPromises.push(d3.csv(`data/${settings.dataset}/events/events${('0' + i).slice(-2)}.csv`))
}

// load the param data
Promise.all([...paramDataPromises]).then((paramData) => {
  // load the event data
  Promise.all([...dataPromises]).then(function (eventData) {
    console.log('All data loaded');
    let combinedData = [];
    // combine data so it is ordered together
    for(let i = 0; i < paramData.length; i++) {
      combinedData.push({
        param: paramData[i],
        events: eventData[i]
      })
    }
    let hilbertCurve = makeHilbertCurve(combinedData);
    let ktree = makeKtTree(combinedData);
    ktree.setTraverseList();
    let orderedData = ktree.traverseList;
    // place the data in order
    if(settings.reorderData) {
      orderedData = reorderData(hilbertCurve);
    } else {
      let points = [];
      for (let i = 0; i < combinedData.length; i++) {
          points.push(new Point(getDimensions(combinedData[i].param), combinedData[i]));
      }

      points = filterPoints(points, 0.0005);
      orderedData = [];
      for (let i = 0; i < points.length; i++) {
          orderedData.push(points[i].data);
      }
    }     

    // split the ordered data into params and event data
    let orderedParamData = [];
    let orderedEventsData = [];
    console.log('Target for data indexing', orderedData[1].events);
    for(let i = 0; i < orderedData.length; i++) {
      for(let j = 0; j < orderedData[i].events.length; j++) {
        orderedData[i].events[j].simulationIndex = i;
      }
      orderedParamData.push(orderedData[i].param);
      orderedEventsData.push(orderedData[i].events);
    }

    // initialize the param and the scatter vis
    paramVis.init(orderedParamData, hilbertCurve.getBoundaries());
    scatter.init(orderedEventsData);

    let distances = calcDistances(orderedParamData);

    let eventTypes = ['collision', 'beta = 0', 'pr = 0', 'pphi = 0', 'ptheta = 0'];
    eventTypeVis.setEventCols(eventTypes);

    // add the event type selection boxes
    d3.select('#event-groups')
      .append('form')
      .selectAll('input')
      .data(eventTypes)
      .enter()
      .append('g')
      .attr('class', 'checkboxes')
      ;

    // create buttons so the user can select which event type to display
    d3.selectAll('.checkboxes')
      .append('input')
      .attr('type', 'radio')
      .attr('name', 'event-type')
      .attr('value', (d) => { return d; })
      .text(d => { return `${d}`; })
      .on('click', (type) => {
        console.log('type', type);
        let filteredData = orderedEventsData.map((d) => {
          return d.filter(d => {
            return d[' event_type'] == type;
          })
        })
        eventTypeVis.update(filteredData, orderedParamData, distances);
      })
      ;

    d3.selectAll('.checkboxes')
      .append('label')
      .text(d => { return `${d}`; })
      ;

    d3.selectAll('.checkboxes')
      .append('br')
      ;
      // */

  }).catch(function (err) { })
});

