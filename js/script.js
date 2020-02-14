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
    let ktree = makeKTree(combinedData);
    let orderedData = []; 
    // place the data in order
    if(settings.reorderData) {
      orderedData = reorderData(ktree);
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
    for(let i = 0; i < orderedData.length; i++) {
      orderedParamData.push(orderedData[i].param);
      orderedEventsData.push(orderedData[i].events);
    }

    // initialize the param and the scatter vis
    paramVis.init(orderedParamData, ktree.getBoundaries());
    scatter.init(orderedEventsData);

  }).catch(function (err) { })
});

