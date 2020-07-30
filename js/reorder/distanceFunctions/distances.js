
function calculate_test_distance(sim1, sim2) {
  let indexFromSim1 = 0, indexFromSim2 = 0;
  while(indexFromSim1 < sim1.events.length - 1 && !sim1.events[indexFromSim1].on) {
    indexFromSim1++;
  }
  while(indexFromSim2 < sim2.events.length - 1 && !sim2.events[indexFromSim2].on) {
    indexFromSim2++;
  }

  let dist = sim2.events[indexFromSim2].t - sim1.events[indexFromSim1].t;
  console.log('Distance: ', dist);
  return dist;
}

let distance_functions = [
  {
      name: 'Test Distance',
      calculate: calculate_test_distance
  },
  {
      name: 'Dynamic Time Warp',
      calculate: reorder_dtw
  },
  {
      name: 'Hausdorff',
      calculate: reorder_hausdorff
  }
]
