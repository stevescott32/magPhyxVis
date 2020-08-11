const sd = new SimulationDistance()
const simulation1 = [75, 292, 426]
const simulation2 = [86, 405]
const INTEGER = 1 

console.assert(sd.getTNWScore(simulation1, simulation2, -1, 1, -1, d => d).score.cellMax === 0.8227972486079266, "getTNW() returns incorrect value")

console.assert(sd.getTNWScore(simulation2, simulation1, -1, 1, -1, d => d).score.cellMax === 0.8227972486079266, "getTNW() returns incorrect value")

console.assert(sd.getTNWScore([], [INTEGER], -1, 1, -1, d => d).score.cellMax === -1, "getTNW() does not handle simulations as empty arrays")

console.assert(sd.getTNWScore([INTEGER], [], -1, 1, -1, d => d).score.cellMax === -1, "getTNW() does not handle simulations as empty arrays")

