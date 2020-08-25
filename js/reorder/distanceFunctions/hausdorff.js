/**
 * get the index of the closest event in correlating array
 * @param event the target event
 * @param arr an array of events to look for correlating events in
 * @param valueSelector a function to get the dimmension for comparison
 * @return the index in arr where the correlating event is found
 */
function getClosestEventIndex(event, arr, valueSelector) {
  let minIndex = 0;
  let minValue = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < arr.length; i++) {
    if(arr[i].on) {
      let difference = Math.abs(valueSelector(event) - valueSelector(arr[i]));
      // console.log(`The difference between ${value} and ${valueSelector(arr[i])} is ${difference}`)
      if (difference < minValue) {
        minValue = difference;
        minIndex = i;
      }
    }
  }

  return minIndex;
}

// returns array of indexes from correlating array of closest event
function getEventsDistance(events1, events2, valueSelector) {
  let correlatingEventDistances = [];
  for (let i = 0; i < events1.length; i++) {
    if(events1[i].on) {
      // correlatingEventDistances.push(getClosestEventIndex(valueSelector(events1[i]), events2, valueSelector));
      let closest = getClosestEventIndex(events1[i], events2, valueSelector);
      // console.log(`The closest index to ${i} is ${closest}`);
      correlatingEventDistances.push(closest);
    }
  }
  return correlatingEventDistances;
}

/**
 * Caclulate how far apart the simulations are using the Hausdorff method
 * @param sim1 one simulation
 * @param sim2 the second simulation
 * @return an number representing the distance between the two simulations
 */
function calculateHausdorffDistance(sim1, sim2) {
  let smallEvents = sim1.events;
  let largeEvents = sim2.events;
  const valueSelector = d => d.t
  let smallEventsDistances = getEventsDistance(smallEvents, largeEvents, valueSelector);
  let largeEventsDistances = getEventsDistance(largeEvents, smallEvents, valueSelector);

  let correlatingPointsDistances = [];
  const pairs = []
  let result = 0;
  for (let i = 0; i < largeEventsDistances.length; i++) {
    let possibleCorrelatingPoint = largeEventsDistances[i];
    if (smallEventsDistances[possibleCorrelatingPoint] == i) {
      let distance = Math.abs(smallEvents[possibleCorrelatingPoint].t - largeEvents[i].t);
      // correlatingPointsDistances.push(distance);
      if(distance > result) {
        result = distance;
      }
      pairs.push([possibleCorrelatingPoint, i])
    }
  }
  // let result = Math.max(...correlatingPointsDistances);
  console.log('Hausdorff distance', result);
  return result;
  // return [correlatingPointsDistances, pairs];
}
