let data_sets = [
    {
        name: 'Trading Data',
        sim_count: 144,
        events_folder: 'momentumTradingData/events',
        param_folder: null,
        parse: parseStockMarketData,
    },
    {
        name: 'MagPhyx Grid',
        sim_count: 144,
        events_folder: 'data4/events',
        param_folder: 'data4/params',
        parse: parseMagPhyxData,
    },
    {
        name: 'MagPhyx Random (7)',
        sim_count: 144,
        events_folder: 'data7/events',
        param_folder: 'data7/params',
        parse: parseMagPhyxData,
    }
];

/**
 * Data parsers should structure the data as follows:
 * 
 * simulations = {
 *   buy: [
 *     { 
 *       params:
 *       meta:
 *       events: []
 *     }
 *   ]
 *   sell: [
 *     { 
 *       params:
 *       meta:
 *       events: []
 *     }
 *   ]
 * }
 * 
 */
function parseStockMarketData(eventData) {
    let simulations = {};

    for(let i = 0; i < eventData.length; i++) {
        let sim = eventData[i];
        console.log('sim x', sim);

        for(let j = 0; j < sim.length; j++) {
            let event_type = sim[j]['event_type'];
            console.log('event type ', event_type);
            if(simulations[event_type] == undefined) {
                simulations[event_type] = {
                    param: null,
                    events: new Array(sim.length),
                    meta: {}
                };
            }
            simulations[event_type][i].events.push(
                eventData[i][j]);
            // if(simulations[event_type][i] == undefined) {
            //     simulations[event_type][i] = [];
            // }
        }
    }
    console.log(simulations);

    return eventData;

    /*
    function getDimensions(dataElement) {
        dims = [];
        dims.push(dataElement['theta'].toFixed(5));
        dims.push(dataElement['beta'].toFixed(5));
        return dims;
    }
    // starting here, all this should be simplified to a single
    // call to dataEngine.parse
    let points = [];
    for (let i = 0; i < data.length; i++) {
        points.push(new Point(getDimensions(data[i].param), data[i]));
    }

    points = filterPoints(points, 0.1);
    let boundary = new Boundary([-3, -3], [3, 3]);
    let ktree = new KTree(boundary, 1);
    for (let i = 0; i < points.length; i++) {
        ktree.insertPoint(points[i]);
    }
    ktree.setTraverseList();
    return ktree;

    let combinedData = [];
    // combine data so it is ordered together
    for (let i = 0; i < paramData.length; i++) {
        combinedData.push({
            param: paramData[i],
            events: eventData[i]
        })
    }
    let orderEngine;

    let ktree = makeKtTree(combinedData);
    if (settings.hilbert) {
        orderEngine = makeHilbertCurve(combinedData);
    } else {
        orderEngine = ktree;
    }
    ktree.setTraverseList();
    let orderedData = ktree.traverseList;

    // place the data in order
    if (settings.reorderData) {
        orderedData = reorderData(orderEngine);
    } else { // leave data in the order that simulations were generated
        let points = [];
        for (let i = 0; i < combinedData.length; i++) {
            points.push(new Point(getDimensions(combinedData[i].param), combinedData[i]));
        }

        points = filterPoints(points, 0.1);
        orderedData = [];
        for (let i = 0; i < points.length; i++) {
            orderedData.push(points[i].data);
        }
    }

    // split the ordered data into params and event data
    let orderedParamData = [];
    let orderedEventsData = [];
    console.log('Target for data indexing', orderedData[1].events);
    for (let i = 0; i < orderedData.length; i++) {
        for (let j = 0; j < orderedData[i].events.length; j++) {
            orderedData[i].events[j].simulationIndex = i;
            orderedData[i].events[j][' t'] = +orderedData[i].events[j][' t']
        }
        orderedParamData.push(orderedData[i].param);
        orderedEventsData.push(orderedData[i].events);
    }
    // End TODO of simplifying to a single call to data.parse
    */

}

function parseMagPhyxData(eventData, paramData) {

}
