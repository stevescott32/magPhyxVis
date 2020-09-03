function reorder_z_order(data) {
    let ktree = makeKtTree(data);
    ktree.setTraverseList();
    let orderedData = ktree.traverseList;
    return orderedData;
}

function reorder_hilbert(data) {
    // hilbert reorder currently has to be done
    // as a pre-processing step, so return the
    // data as it was parsed
    return data;
}

function reorder_dtw(data) {
    return data;
}

function reorder_hausdorff(data) {
    return data;
}

function reorder_dist_from_first(data, distFunction) {
    console.log('Reordering by distance from first', data, distFunction);
    let firstSim = data.simulations[0];

    data.simulations.sort(function(a, b) {
        let distA = distFunction.calculate(firstSim, a)
        let distB = distFunction.calculate(firstSim, b)
        a.meta.distance = distA;
        b.meta.distance = distB;
        return distA - distB;
    });
    console.log('Reordered data: ', data);
    return data;
}

function minTimeFromSelected(sim, selectedEvent) {
    let minTimeDiff = Number.MAX_SAFE_INTEGER;
    sim.events.forEach(event => {
        let potentialDiff = Math.abs(selectedEvent.t - event.t);
        if(event.on && potentialDiff < minTimeDiff) {
            minTimeDiff = potentialDiff;
        }
    })
    console.log('Found a minimum time diff', minTimeDiff, selectedEvent);
    return minTimeDiff;
}

const eventFamilyTolerance = 0.1;
function simContantsEvent(sim, selectedEvent) {
    sim.events.forEach(event => {
        if(event.on && Math.abs(selectedEvent.t - event.t) < eventFamilyTolerance) {
            console.log('The simulation has an event in the family', event, selectedEvent);
            return true;
        }
    })
    return false;
}

/**
 * 
 * @param {object} data 
 */
function reorderEventFamily(data) {
    let selectedEvent = data.simulations[0].events[0];
    data.simulations.forEach(sim => {
        sim.events.forEach(event => {
            if(event.eventSelected) {
                selectedEvent = event;
                console.log('Party!', selectedEvent);
            }
        })
    });

    data.simulations.sort(function(a, b) {
        console.log('a, b', a, b);
        let aDiff = minTimeFromSelected(a, selectedEvent);
        let bDiff = minTimeFromSelected(b, selectedEvent);
        // let aContainsEvent = simContantsEvent(a, selectedEvent);
        // let bContainsEvent = simContantsEvent(b, selectedEvent);
        // let result = 0;
        // if(aContainsEvent && ! bContainsEvent) {
        //     result = -1;
        // } 
        // else if(!aContainsEvent && bContainsEvent) {
        //     result = 1;
        // }
        // console.log('Sorting result: ', result, aContainsEvent, bContainsEvent);
        // return result;
        return aDiff - bDiff;
    });
    console.log('Reordered data: ', data);

    return data;
}

let ways_to_reorder = [
    {
        name: 'Hilbert (parameter space)',
        reorder: reorder_hilbert,
    },
    {
        name: 'Z-Order (parameter space)',
        reorder: reorder_z_order,
    },
    {
        name: 'Distance From First Sim',
        reorder: reorder_dist_from_first
    },
    {
        name: "Selected Event's family",
        reorder: reorderEventFamily
    }
]
