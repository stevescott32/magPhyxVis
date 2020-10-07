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

let reorderLogs = 2;
function reorder_dist_from_first(data, distFunction) {
    console.log('Reordering by distance from first', data, distFunction);
    let firstSim = data.simulations[0];

    data.simulations.sort(function(a, b) {
        let distA = distFunction.calculate(firstSim, a)
        let distB = distFunction.calculate(firstSim, b)
        if(reorderLogs-- > 0) {
            console.log(`Calculating another distance as ${distA} - ${distB} = ${distA - distB}`);
        }
        a.meta.distance = distA;
        b.meta.distance = distB;
        return distA - distB;
    });
    console.log('Reordered data: ', data);
    return data;
}

function spectral_cluster_dist(data, distFunc)
{
  var kMeansClusters = {};
  kMeansClusters.clusters = newSpectralClustering(data.simulations, 8, distFunc.calculate);

  data.simulations = [];
  let order = [];
  for (var i = 0; i < kMeansClusters.clusters.length; ++i) {
    var customColorScale = [
      'grey', 'orange', 'red', 'brown', 'blue', 'purple', 'green', 'pink',
      'yellow', 'grey', 'orange', 'red', 'brown', 'blue', 'purple', 'green',
      'pink', 'yellow', 'black'
    ];

    kMeansClusters.clusters.forEach(function(d) {
      order.push(d.index);
      d.events.forEach(e => e.color = d.color);
      // if (kMeansClusters.clusterOrigins.some(o => o.meta.simulationIndex ==
      //                                             d.index)) {
      //   d.events.forEach(d => d.color = customColorScale.length - 1);
      // } else {
      //   d.events.forEach(d => d.color = i);
      // }
    });

    data.getColor = function(d) { return d.color; };

    data.simulations = data.simulations.concat(kMeansClusters.clusters[i]);
  }

  return data;
}

function kmeans_cluster_dist(data, distFunc)
{
  let kMeansClusters = kMeansClustering(data.simulations, 8, 5, distFunc.calculate);

  data.simulations = [];
  for (var i = 0; i < kMeansClusters.clusters.length; ++i) {
    var customColorScale = [
      'grey', 'orange', 'red', 'brown', 'blue', 'purple', 'green', 'pink',
      'yellow', 'grey', 'orange', 'red', 'brown', 'blue', 'purple', 'green',
      'pink', 'yellow', 'black'
    ];

    kMeansClusters.clusters[i].forEach(function(d) {
      if (kMeansClusters.clusterOrigins.some(o => o.meta.simulationIndex ==
                                                  d.index)) {
        d.events.forEach(d => d.color = customColorScale.length - 1);
      } else {
        d.events.forEach(d => d.color = i);
      }
    });

    data.getColor = function(d) { return customColorScale[d.color]; };

    data.simulations = data.simulations.concat(kMeansClusters.clusters[i]);
  }

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
        name: 'Kmeans Cluster Distance',
        reorder: kmeans_cluster_dist
    },
    {
        name: 'Spectral Cluster Distance',
        reorder: spectral_cluster_dist
    }
]
