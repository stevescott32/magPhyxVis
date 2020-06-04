function mstTestCase()
{
  let node0 = new Point([0,0]);
  let node1 = new Point([1,1]);
  let node2 = new Point([2,2]);
  let node3 = new Point([3,3]);
  let node4 = new Point([4,4]);
  let node5 = new Point([5,5]);
  let node6 = new Point([6,6]);
  let node7 = new Point([7,7]);
  let node8 = new Point([8,8]);

  MST = new Graph();
  MST.addNode(node0);
  MST.addNode(node1);
  MST.addNode(node2);
  MST.addNode(node3);
  MST.addNode(node4);
  MST.addNode(node5);
  MST.addNode(node6);
  MST.addNode(node7);
  MST.addNode(node8);

  MST.edges[toKey(node0)].push({node : node1, weight : 4});
  MST.edges[toKey(node0)].push({node : node7, weight : 8});
  MST.edges[toKey(node1)].push({node : node7, weight : 11});
  MST.edges[toKey(node1)].push({node : node2, weight : 8});
  MST.edges[toKey(node2)].push({node : node3, weight : 7});
  MST.edges[toKey(node2)].push({node : node5, weight : 4});
  MST.edges[toKey(node2)].push({node : node8, weight : 2});
  MST.edges[toKey(node3)].push({node : node4, weight : 9});
  MST.edges[toKey(node3)].push({node : node5, weight : 14});
  MST.edges[toKey(node4)].push({node : node5, weight : 10});
  MST.edges[toKey(node5)].push({node : node6, weight : 2});
  MST.edges[toKey(node6)].push({node : node7, weight : 1});
  MST.edges[toKey(node6)].push({node : node8, weight : 6});
  MST.edges[toKey(node7)].push({node : node8, weight : 7});

  MST = MST.kruskalsMST();

}

let failCase = [
  new Point([ 2, 16 ]), new Point([ 76, 17 ]), new Point([ 61, 25 ]),
  new Point([ 75, 17 ]), new Point([ 18, 9 ]), new Point([ 54, 70 ]),
  new Point([ 3, 52 ]), new Point([ 55, 43 ]), new Point([ 81, 46 ]),
  new Point([ 84, 33 ])
];

let color = [ "#ff5733", "#00FFFF", "#00FF00", "#FF00FF", "#0000FF" ];

let randPoints = [];
let NUMPOINTS = 100;
let NUMITERS = 100;
let NUMCLUSTERS = 5;

function genRandPoint(lowerBound = 0, upperBound = 100){
  return new Point([
    Math.floor(Math.random() * (upperBound + 1 - lowerBound)) + lowerBound,
    Math.floor(Math.random() * (upperBound + 1 - lowerBound)) + lowerBound
  ]);
}

function convertToData(pointArray)
{
  let data = [];
  for (let point of pointArray)
  {
    data.push({X : point.coordinates[0], Y : point.coordinates[1]});
  }

  return data;
}

function fromKey(key) { return new Point(key.split(',').map(x => +x)); }
function toKey(key) {return key.coordinates.toString();}

function distance(pointA, pointB) {
  let result = Math.sqrt(Math.pow(Math.abs(pointA.coordinates[0] - pointB.coordinates[0]), 2) +
                         Math.pow(Math.abs(pointA.coordinates[1] - pointB.coordinates[1]), 2));
  return result;
}

for (let i = 0; i < NUMPOINTS; ++i)
{
  randPoints.push(genRandPoint());
}

// let clusters = mstClustering(randPoints, NUMCLUSTERS, distance, toKey, fromKey);
let kMeansClusters = kMeansClustering(randPoints, NUMCLUSTERS, NUMITERS, distance, toKey, fromKey);
let clusters = kMeansClusters["clusters"];

// ===================================================================
// ===================================================================

var margin = {top : 20, right : 20, bottom : 30, left : 40};

var width = 700 - margin.left - margin.right;
var height = 700 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([ 0, width ]);
var y = d3.scaleLinear().range([ height, 0 ]); // Scale the range of the data

x.domain([ 0, 100 ]);
y.domain([ 0, 100 ]);

var svg =
    d3.select("#my_scatter")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append('g')
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
svg.append('g').call(d3.axisLeft(y));

clusters.forEach(function(cluster, index) {

  let clusterData = convertToData(cluster);

  var path = svg.selectAll("dot")
     .data(clusterData)
     .enter().append("circle")
     .attr("r", 5)
     .attr("cx", function (d) {
           return x(d.X);
     })
     .attr("cy", function (d) {
          return y(d.Y);
     })
     .attr("stroke", "#32CD32")
     .attr("stroke-width", 1.5)
     .attr("fill", color[index]);

});
// ===================================================================
// ===================================================================
