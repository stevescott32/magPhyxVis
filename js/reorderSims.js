function reorder_z_order(data) {
    return data;
}

function reorder_hilbert(data) {
    // hilbert curve is not yet implemented, return data as-is
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
        name: 'Hilbert',
        reorder: reorder_hilbert,
    },
    {
        name: 'Z-Order',
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
