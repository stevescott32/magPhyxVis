console.log('Starting script');

let settings = {
  NUM_FILES: 100,
  dontReorder: false,
  dataset: 'data6'
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
    for(let i = 0; i < paramData.length; i++) {
      combinedData.push({
        param: paramData[i],
        events: eventData[i]
      })
    }
    console.log('Ordering data');
    let ktree = makeKTree(combinedData);
    console.log('ktree made');
    let orderedData = reorderData(ktree);
    console.log('Data is ordered', orderedData);
    let orderedParamData = [];
    let orderedEventsData = [];
    for(let i = 0; i < orderedData.length; i++) {
      orderedParamData.push(orderedData[i].param);
      orderedEventsData.push(orderedData[i].events);
    }

    console.log('Initializing param vis');
    paramVis.init(orderedParamData, ktree);
    console.log('Initializing scatter vis');
    scatter.init(orderedEventsData);

  }).catch(function (err) { })
});

