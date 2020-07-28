
let logsLeft = 10;
function calculate_test_distance(sim1, sim2) {
  let dist = sim1.events[0][' t'] - sim2.events[0][' t'];
  if(logsLeft-- > 0) {
    console.log('Dist', dist);
  }
  return dist;
}

let distance_functions = [
  {
      name: 'Dynamic Time Warp',
      calculate: reorder_dtw
  },
  {
      name: 'Hausdorff',
      calculate: reorder_hausdorff
  },
  {
      name: 'Test Distance',
      calculate: calculate_test_distance
  }
]
