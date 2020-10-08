/**
 * This file is the starting point for the program.
 * It loads the data and initializes the visualizations.
 */

console.log('Starting script');

let dataSet = data_sets[0];
let reorderer = ways_to_reorder[0];
let distance_func = distance_functions[0];

let keyboard = new Keyboard();

let eventTypeVis = new EventTypeVis(keyboard);
let paramVis = new ParamsVis();
let scatter = new Scatter();
let allData = {};

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
// addDistanceSelector();

// kick off the vis by loading the data
loadDataAndVis(dataSet);

function loadDataAndVis(selectedDataSet) {
  // get how many digits are required to represent the number
  let slice_format = selectedDataSet.sim_count.toString().length; 
  let zeros = '0'.repeat(slice_format);
  // create promises so all data can load asynchronous
  // promise the param data
  let paramDataPromises = [];
  if (selectedDataSet.param_folder != null) {
    for (let i = 0; i < selectedDataSet.sim_count; i++) {
      let path = `data/${selectedDataSet.param_folder}/commands${(zeros + i).slice(-1 * slice_format)}.csv`;
      // console.log('Path: ', path);
      paramDataPromises.push(d3.csv(path));
    }
  }

  // promise the event data
  let dataPromises = [];
  for (let i = 0; i < selectedDataSet.sim_count; i++) {
    let path = `data/${selectedDataSet.events_folder}/events${(zeros + i).slice(-1 * slice_format)}.csv`
    // console.log('Path: ', path);
    dataPromises.push(d3.csv(path));
  }

  // load the param data
  Promise.all([...paramDataPromises]).then((paramData) => {
    console.log('Param data loaded');
    // load the event data
    Promise.all([...dataPromises]).then(function (eventData) {
      console.log('All data loaded');

      paramData = standardizeParamData(paramData);

      let data = selectedDataSet.parse(eventData, paramData);
      console.log('Parsed data: ', data);
      allData = data;

      loadVis(data, reorderer);

    }).catch(function (err) {
      console.log('Error in main script: ', err);
      console.trace(err);
    })
  });
}

function loadVis(data, reorderer) {
  let orderedData = reorderer.reorder(data, distance_func);

  // initialize the param and the scatter vis
  paramVis.init(orderedData);
  scatter.init(orderedData);

  eventTypeVis.setNumSimulations(orderedData.simulations.length);
  eventTypeVis.setEventCols(orderedData.eventTypes);
  addEventTypeSelector(orderedData);
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
    .on('click', (selectedOrder) => {
      console.log('order', selectedOrder);
      for (let i = 0; i < ways_to_reorder.length; i++) {
        let oneWayToReorder = ways_to_reorder[i];
        if (oneWayToReorder.name == selectedOrder.name) {
          reorderer = oneWayToReorder;
          if(selectedOrder.name.toLowerCase().includes('distance')) {
            // add the distance selector, but do not load the vis until the user
            // has selected a distance method
            addDistanceSelector();
          } else {
            removeDistanceSelector();
            loadVis(allData, reorderer);
          }
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

const distClassTag = 'distance-function';
const distHeadingTag = 'distance-select-heading';
function removeDistanceSelector() {
  d3.selectAll(distClassTag)
    .remove();

  d3.selectAll(`.${distHeadingTag}`)
    .remove();
}

function addDistanceSelector() {
  // add the event type selection boxes
  d3.select('#settings')
    .append('h4')
    .text('Distance Function:')
    ;

  d3.select('#settings')
    .append('form')
    .selectAll('input')
    .data(distance_functions)
    .enter()
    .append('g')
    .attr('class', distClassTag)
    ;

  // create buttons so the user can select which event type to display
  d3.selectAll(`.${distClassTag}`)
    .append('input')
    .attr('type', 'radio')
    .attr('name', 'event')
    .attr('value', (d) => { return d; })
    .text(d => { return `${d.name}`; })
    .on('click', (selectedDistance) => {
      distance_func = selectedDistance;
      if (selectedDistance.name === 'Temporal Needleman Wunsch') addTNWParameters();
      else removeTNWParameters();
      // loadVis(allData, reorderer);
    })
    ;

  d3.selectAll(`.${distClassTag}`)
    .append('label')
    .attr('id', d =>{ return `${d.name}`})
    .text(d => { return `${d.name}`; })
    ;

  d3.selectAll(`.${distClassTag}`)
    .append('br')
    ;

  d3.select('#settings')
    .append('br')
    ;

}

function addTNWParameters() {
  d3.select('.tnw-parameters')
    .style('display', 'inline')
    ;
}

function removeTNWParameters() {
  d3.select('.tnw-parameters')
  .style('display', 'none')
}


// create buttons so the user can select which event type to display
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
  d3.selectAll('.checkboxes')
    .append('input')
    .attr('type', 'radio')
    .attr('name', 'event-type')
    .attr('value', (d) => { return d; })
    .text(d => { return `${d}`; })
    .on('click', (type) => {
      console.log(`Select all events of type ${type}`);
      for(let sim = 0; sim < data.simulations.length; sim++) {
        for(let e = 0; e < data.simulations[sim].events.length; e++) {
          let event = data.simulations[sim].events[e];
          if(event['event_type'] == type) {
            event.on = true;
            event.eventTypeOn = true;
          } else {
            event.on = false;
            event.eventTypeOn = false;
          }
        }
      }
      eventTypeVis.removeEventsMatch()
      // data = reorderer.reorder(data, distance_func);
      loadVis(allData, reorderer);
      eventTypeVis.update(data);
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
