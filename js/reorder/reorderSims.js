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

let reorderLogs = 10;
function reorder_dist_from_first(data, distFunction) {
    console.log('Reordering by distance from first', data, distFunction);
    let firstSim = data.simulations[0];

    data.simulations.sort(function(a, b) {
        let distA = distFunction.calculate(firstSim, a)
        let distB = distFunction.calculate(firstSim, b)
        if(reorderLogs-- > 0) {
            console.log(`Calculating another distance as ${distA - distB}`);
        }
        a.meta.distance = distA;
        b.meta.distance = distB;
        return distA - distB;
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
    }
]
