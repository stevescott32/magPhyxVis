// all possible distance functions should be part of this array
let distance_functions = [
  {
    name: 'Test Distance',
    calculate: calculateTestDistance
  },
  {
    name: 'Dynamic Time Warp',
    calculate: calculateDTW
  },
  {
    name: 'Hausdorff',
    calculate: calculateHausdorffDistance
  },
  {
    name: 'Temporal Needleman Wunsch',
    calculate: calculateTNWDistance
  },
]

/**
 * a test distance function - calculates the time difference
 * between the first on event in the simulation
 */
function calculateTestDistance(sim1, sim2) {
  let indexFromSim1 = 0, indexFromSim2 = 0;
  while (indexFromSim1 < sim1.events.length - 1 && !sim1.events[indexFromSim1].on) {
    indexFromSim1++;
  }
  while (indexFromSim2 < sim2.events.length - 1 && !sim2.events[indexFromSim2].on) {
    indexFromSim2++;
  }

  let dist = sim2.events[indexFromSim2].t - sim1.events[indexFromSim1].t;
  console.log('Test Distance: ', dist);
  return dist;
}

