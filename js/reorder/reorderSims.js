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
        name: 'Dynamic Time Warp',
        reorder: reorder_dtw
    },
    {
        name: 'Hausdorff',
        reorder: reorder_hausdorff
    }
]
