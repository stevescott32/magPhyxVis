/**
 * This file is the starting point for the program.
 * It loads the data and initializes the visualizations.
 */

console.log('Starting script');

let dataSet = data_sets[0];
let reorderer = ways_to_reorder[0];

let eventTypeVis = new EventTypeVis(/*data_set.sim_count*/);
let paramVis = new ParamsVis();
let scatter = new Scatter();


// let each vis know about the other event vis
scatter.setParamVis(paramVis);
scatter.setEventVis(eventTypeVis);
paramVis.setScatter(scatter);
paramVis.setEventVis(eventTypeVis);
eventTypeVis.setParamVis(paramVis);
eventTypeVis.setScatterVis(scatter);

// setup the radio buttons for the settings
addDataInput();
addReorderSelector();

// kick off the vis by loading the data
loadDataAndVis(dataSet);


function loadDataAndVis(selectedDataSet) {
  let slice_format = (selectedDataSet.sim_count % 10) - 1;
  let zeros = '0'.repeat(slice_format);
  // create promises so all data can load asynchronous
  // promise the param data
  let paramDataPromises = [];
  // TODO put these promises into the data possibilities structure
  if (selectedDataSet.param_folder != null) {
    for (let i = 0; i < selectedDataSet.sim_count; i++) {
      let path = `data/${selectedDataSet.param_folder}/commands${(zeros + i).slice(-1 * slice_format)}.csv`;
      // console.log('Path: ', path);
      paramDataPromises.push(d3.csv(path));
    }
  }

  // promise the event data
  let dataPromises = [];
  // TODO put these promises into the data possibilities structure
  for (let i = 0; i < selectedDataSet.sim_count; i++) {
    let path = `data/${selectedDataSet.events_folder}/events${(zeros + i).slice(-1 * slice_format)}.csv`
    // console.log('Path: ', path);
    dataPromises.push(d3.csv(path));
  }

  // load the param data
  Promise.all([...paramDataPromises]).then((paramData) => {
    // load the event data
    Promise.all([...dataPromises]).then(function (eventData) {
      console.log('All data loaded');

      paramData = standardizeParamData(paramData);

      let data = selectedDataSet.parse(eventData, paramData);

      loadVis(data, reorderer);

    }).catch(function (err) {
      console.log('Error in main script: ', err);
      console.trace(err);
    })
  });
}

function loadVis(data, reorderer) {
  let orderedData = reorderer.reorder(data);

  // initialize the param and the scatter vis
  paramVis.init(data);
  scatter.init(data);

  // TODO this should be more dynamic - switched to an array of 
  // distance calculation functions
  // let distances = calcDistances(orderedParamData);

  eventTypeVis.setEventCols(data.eventTypes);
  addEventTypeSelector(data);
}

function addDataInput() {
  // add the event type selection boxes
  d3.select('#settings')
    .append('h4')
    .text('Data Set:')
    ;

  d3.select('#settings')
    .append('form')
    .selectAll('input')
    .data(data_sets)
    .enter()
    .append('g')
    .attr('class', 'data-options')
    ;

  // create buttons so the user can select which event type to display
  d3.selectAll('.data-options')
    .append('input')
    .attr('type', 'radio')
    .attr('name', 'event')
    .attr('value', (d) => { return d; })
    .text(d => { return `${d.name}`; })
    .on('click', (d) => {
      console.log('type', d);
      loadDataAndVis(d);
    })
    ;

  d3.selectAll('.data-options')
    .append('label')
    .text(d => { return `${d.name}`; })
    ;

  d3.selectAll('.data-options')
    .append('br')
    ;

}

function addReorderSelector() {
  // add the event type selection boxes
  d3.select('#settings')
    .append('h4')
    .text('Order:')
    ;

  d3.select('#settings')
    .append('form')
    .selectAll('input')
    .data(ways_to_reorder)
    .enter()
    .append('g')
    .attr('class', 'order-options')
    ;

  // create buttons so the user can select which event type to display
  d3.selectAll('.order-options')
    .append('input')
    .attr('type', 'radio')
    .attr('name', 'event')
    .attr('value', (d) => { return d; })
    .text(d => { return `${d.name}`; })
    .on('click', (d) => {
      console.log('order', d);
      for (let i = 0; i < ways_to_reorder.length; i++) {
        let oneWayToReorder = ways_to_reorder[i];
        if (oneWayToReorder.name == d) {
          loadVis(dataSet, oneWayToReorder);
        }
      }
    })
    ;

  d3.selectAll('.order-options')
    .append('label')
    .text(d => { return `${d.name}`; })
    ;

  d3.selectAll('.order-options')
    .append('br')
    ;

  d3.select('#settings')
    .append('br')
    ;
}

function addEventTypeSelector(data) {
  console.log('Adding event type selector', data);

  d3.selectAll('.checkboxes')
    .remove()
    ;

  // add the event type selection boxes
  d3.select('#event-groups')
    .append('form')
    .selectAll('input')
    .data(data.eventTypes)
    .enter()
    .append('g')
    .attr('class', 'checkboxes')
    ;

  // create buttons so the user can select which event type to display
  console.log('Pre map X', data.simulations);
  d3.selectAll('.checkboxes')
    .append('input')
    .attr('type', 'radio')
    .attr('name', 'event-type')
    .attr('value', (d) => { return d; })
    .text(d => { return `${d}`; })
    .on('click', (type) => {
      console.log('type', type);
      let filteredData = data.simulations.map(d => {
        return d.events.filter(d => {
          return d['event_type'] == type;
        })
        // return true;
      })
      console.log("filtered data: ");
      console.log(filteredData);
      eventTypeVis.removeEventsMatch()
      eventTypeVis.update(filteredData);
    })
    ;

  d3.selectAll('.checkboxes')
    .append('label')
    .text(d => { return `${d}`; })
    ;

  d3.selectAll('.checkboxes')
    .append('br')
    ;
}
