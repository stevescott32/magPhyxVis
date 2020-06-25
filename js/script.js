/**
 * This file is the starting point for the program.
 * It loads the data and initializes the visualizations.
 */

console.log('Starting script');

let data_set = data_sets[0];
let reorderer = ways_to_reorder[0];

let eventTypeVis = new EventTypeVis(data_set.sim_count);
let paramVis = new ParamsVis();
let scatter = new Scatter();

  
// let each vis know about the other event vis
scatter.setParamVis(paramVis);
scatter.setEventVis(eventTypeVis);
paramVis.setScatter(scatter);
paramVis.setEventVis(eventTypeVis);
eventTypeVis.setParamVis(paramVis);
eventTypeVis.setScatterVis(scatter);

let slice_format = (data_set.sim_count % 10) - 1;
let zeros = '0'.repeat(slice_format);
// create promises so all data can load asynchronous
// promise the param data
let paramDataPromises = [];
// TODO put these promises into the data possibilities structure
if (data_set.param_folder != null) {
  for (let i = 0; i < data_set.sim_count; i++) {
    let path = `data/${data_set.param_folder}/commands${(zeros + i).slice(-1 * slice_format)}.csv`;
    console.log('Path: ', path);
    paramDataPromises.push(d3.csv(path));
  }
}

// promise the event data
let dataPromises = [];
// TODO put these promises into the data possibilities structure
for (let i = 0; i < data_set.sim_count; i++) {
  let path = `data/${data_set.events_folder}/events${(zeros + i).slice(-1 * slice_format)}.csv`
  console.log('Path: ', path);
  dataPromises.push(d3.csv(path));
}

// load the param data
Promise.all([...paramDataPromises]).then((paramData) => {
  // load the event data
  Promise.all([...dataPromises]).then(function (eventData) {
    console.log('All data loaded');
    // TODO not sure what to do with this line
    paramData = standardizeParamData(paramData);

    let data = data_set.parse(eventData, paramData);
    let orderedData = reorderer.reorder(data);

    // starting here, all this should be simplified to a single
    // call to dataEngine.parse
    // let combinedData = [];
    // combine data so it is ordered together
    // for(let i = 0; i < paramData.length; i++) {
    //   combinedData.push({
    //     param: paramData[i],
    //     events: eventData[i]
    //   })
    // }
    // let orderEngine;

    // let ktree = makeKtTree(combinedData);
    // if(settings.hilbert) {
    //   orderEngine = makeHilbertCurve(combinedData);
    // } else {
    // orderEngine = ktree;
    // }
    // ktree.setTraverseList();
    // let orderedData = ktree.traverseList;

    // place the data in order
    // if(settings.reorderData) {
      // orderedData = reorderData(orderEngine);
    // } else { // leave data in the order that simulations were generated
      // let points = [];
      // for (let i = 0; i < combinedData.length; i++) {
        //   points.push(new Point(getDimensions(combinedData[i].param), combinedData[i]));
      // }

      // points = filterPoints(points, 0.1);
      // orderedData = [];
      // for (let i = 0; i < points.length; i++) {
      //     orderedData.push(points[i].data);
      // }
    // }

    // split the ordered data into params and event data
    // let orderedParamData = [];
    // let orderedEventsData = [];
    // console.log('Target for data indexing', orderedData[1].events);
    // for(let i = 0; i < orderedData.length; i++) {
    //   for(let j = 0; j < orderedData[i].events.length; j++) {
    //     orderedData[i].events[j].simulationIndex = i;
    //     orderedData[i].events[j][' t'] = +orderedData[i].events[j][' t']
    //   }
    //   orderedParamData.push(orderedData[i].param);
    //   orderedEventsData.push(orderedData[i].events);
    // }
    // End TODO of simplifying to a single call to data.parse

    // initialize the param and the scatter vis
    paramVis.init(orderedData, null);
    scatter.init(data);

    // TODO this should be more dynamic - switched to an array of 
    // distance calculation functions
    let distances = calcDistances(orderedParamData);

    // TODO instead of hard-coding these, parse them and store them on
    // the data object
    // let eventTypes = ['collision', 'beta = 0', 'pr = 0', 'pphi = 0', 'ptheta = 0'];
    let eventTypes = ['buy', 'sell', 'stay'];
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
            return d['event_type'] == type;
          })
        })
        console.log("filtered data: " );
        console.log(filteredData);
        eventTypeVis.removeEventsMatch()
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

  }).catch(function (err) { 
    console.log('Error: ', err);
    console.trace();
  })
});

