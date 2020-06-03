class Graph {
  constructor() {
    this.edges = {};
    this.nodes = [];
  }

  addNode(node) {
    if (this.nodes.includes(node)) {
      return;
    }
    this.nodes.push(node);
    this.edges[toKey(node)] = [];
  }

  addEdge(node1, node2, weight = 1) {
    this.edges[toKey(node1)].push({node : node2, weight : weight});
    // this.edges[toKey(node2)].push({node : node1, weight : weight});
  }

  addDirectedEdge(node1, node2, weight = 1) {
    this.edges[toKey(node1)].push({node : node2, weight : weight});
  }

  // return dictionary contained two nodes with the heighest edge weight in the
  // graph
  findLargestEdge() {
    let max = Number.MIN_VALUE;
    var maxEdge;
    for (var key in this.edges) {
      for (var edge of this.edges[key]) {
        if (edge.weight > max)
        max = edge.weight;
        maxEdge = {
          node1 : fromKey(key),
          node2 : edge.node,
          weight : edge.weight
        };
      }
    }

    return maxEdge;
  }

  deleteEdge(edge) {
    let index = this.edges[toKey(edge.node1)].forEach(function(e, index,
                                                        edgeArray) {
      if (this.isEdgeEqual(e, {node : edge.node2, weight : edge.weight})) {
        edgeArray.splice(index, 1);
      }
    }.bind(this));

     index = this.edges[toKey(edge.node2)].forEach(function(e, index,
                                                        edgeArray) {
      if (this.isEdgeEqual(e, {node : edge.node1, weight : edge.weight})) {
        edgeArray.splice(index, 1);
      }
    }.bind(this));
  }

  isEdgeEqual(edgeA, edgeB)
  {
    if (edgeA.node != edgeB.node)
    {
      return false;
    }
    else if (edgeA.weight != edgeB.weight)
    {
      return false;
    }

    return true;
  }

  exploreEdges(edges)
  {
    let retArray = [];

    for (let e of edges) {
      let nextNode = e.node;
      retArray.push(nextNode);
      let nextEdges = this.edges[toKey(nextNode)];
      if (nextEdges.length != 0)
      {
        this.exploreEdges(nextEdges).forEach(p => { retArray.push(p); });
      }
    }

    return retArray;
  }

  cluster(k) {
    let clusters = [];
    let indicies = [...Array(this.nodes.length).keys() ];
    let currentCluster = 0;
    while (indicies.length != 0) {
      clusters[currentCluster] = [];
      let currNode = this.nodes[indicies[0]];
      let currentEdge = this.edges[toKey(currNode)];
      let foundNodes = this.exploreEdges(currentEdge);
      foundNodes.push(currNode);

      for (let fNode of foundNodes)
      {
        clusters[currentCluster].push(fNode);
        let indexToDel = indicies.indexOf(this.nodes.indexOf(fNode));
        if (indexToDel != -1)
        {
          indicies.splice(indexToDel, 1);
        }
      }

      ++currentCluster;
    }

    //combine clusters if possible
    for (let i = 0; i < clusters.length; ++i)
    {
      for (let j = i + 1; j < clusters.length; ++j) {
        if(clusters[i].some(item => clusters[j].includes(item)))
        {
          clusters[i].forEach(item => {
            if (clusters[j].includes(item)) {
            }
            else
            {
              clusters[j].push(item);
            }
          });
          clusters.splice(i, 1);
          j = i;
        }
      }
    }

    return clusters;
  }

  display() {
    let graph = "";
    this.nodes.forEach(node => {
      graph +=
          node + "->" + this.edges[node].map(n => n.node).join(", ") + "\n";
    });
    console.log(graph);
  }

  primsMST() {
    // Initialize graph that'll contain the MST
    const MST = new Graph();
    if (this.nodes.length === 0) {
      return MST;
    }

    // Select first node as starting node
    let s = this.nodes[0];

    // Create a Priority Queue and explored set
    let edgeQueue = new PriorityQueue(this.nodes.length * this.nodes.length);
    let explored = new Set();
    explored.add(s);
    MST.addNode(s);

    // Add all edges from this starting node to the PQ taking weights as
    // priority
    this.edges[s].forEach(edge => {
      edgeQueue.enqueue([ s, edge.node ], edge.weight);
    });

    // Take the smallest edge and add that to the new graph
    let currentMinEdge = edgeQueue.dequeue();
    while (!edgeQueue.isEmpty()) {
      // COntinue removing edges till we get an edge with an unexplored node
      while (!edgeQueue.isEmpty() && explored.has(currentMinEdge.data[1])) {
        currentMinEdge = edgeQueue.dequeue();
      }
      let nextNode = currentMinEdge.data[1];
      // Check again as queue might get empty without giving back unexplored
      // element
      if (!explored.has(nextNode)) {
        MST.addNode(nextNode);
        MST.addDirectedEdge(currentMinEdge.data[0], nextNode,
                            currentMinEdge.priority);

        // Again add all edges to the PQ
        this.edges[nextNode].forEach(edge => {
          edgeQueue.enqueue([ nextNode, edge.node ], edge.weight);
        });

        // Mark this node as explored
        explored.add(nextNode);
        s = nextNode;
      }
    }
    return MST;
  }

  kruskalsMST() {
    // Initialize graph that'll contain the MST
    const MST = new Graph();

    this.nodes.forEach(node => MST.addNode(node));
    if (this.nodes.length === 0) {
      return MST;
    }

    // Create a Priority Queue
    let edgeQueue = new PriorityQueue(this.nodes.length * this.nodes.length);

    // Add all edges to the Queue:
    for (let node in this.edges) {
      this.edges[node].forEach(edge => {
        edgeQueue.enqueue([ fromKey(node), edge.node ], edge.weight);
      });
    }
    let uf = new UnionFind(this.nodes);

    // Loop until either we explore all nodes or queue is empty
    while (!edgeQueue.isEmpty()) {
      // Get the edge data using destructuring
      let nextEdge = edgeQueue.dequeue();
      let nodes = nextEdge.element;
      let weight = nextEdge.priority;

      if (!uf.connected(nodes[0], nodes[1])) {
        MST.addDirectedEdge(nodes[0], nodes[1], weight);
        uf.union(nodes[0], nodes[1]);
      }
    }
    return MST;
  }

  findClusterOrigins(clusters, distFunc)
  {
    let clusterOrigins = [];
    for (let cluster of clusters)
    {
      let minDist = Number.MAX_VALUE;
      var clusterOrigin;
      for (let centerNode of cluster)
      {
        let totalDist = 0;
        for (let node of cluster)
        {
          totalDist += distFunc(node, centerNode);
        }

        if (totalDist < minDist)
        {
          minDist = totalDist;
          clusterOrigin = centerNode;
        }
      }

      clusterOrigins.push(clusterOrigin);
    }

    return clusterOrigins;
  }

  kMeansCluster(k, numIters, distFunc)
  {
    // Init cluster origins
    let clusterOrigins = [];
    let clusters = [];
    for (let j = 0; j < k; ++j) {
      clusterOrigins.push(this.nodes[j]);
    }

    for (let i = 0; i < numIters; ++i)
    {
      clusters = [];
      for (let origin of clusterOrigins)
      {
        clusters.push([]);
      }
      // add nodes to appropriate cluster
      for (let node of this.nodes)
      {
        let minDist = Number.MAX_VALUE;
        let destIndex = -1;
        clusterOrigins.forEach(function(origin, index, clusterOrigins){
          let distToOrigin = distFunc(node, origin);
          if (distToOrigin < minDist)
          {
            minDist = distToOrigin;
            destIndex = index;
          }
        });
        clusters[destIndex].push(node);
      }

      // Find new clusterOrigins
      clusterOrigins = this.findClusterOrigins(clusters, distFunc);
    }

    return {"clusters" : clusters, "clusterOrigins" : clusterOrigins};
  }
}

class UnionFind {
  constructor(elements) {
    // Number of disconnected components
    this.count = elements.length;

    // Keep Track of connected components
    this.parent = {};
    // Initialize the data structure such that all elements have themselves as
    // parents
    elements.forEach(e => (this.parent[e] = e));
  }

  union(a, b) {
    let rootA = this.find(a);
    let rootB = this.find(b);

    // Roots are same so these are already connected.
    if (rootA === rootB)
      return;

    // Always make the element with smaller root the parent.
    if (rootA < rootB) {
      if (this.parent[b] != b)
        this.union(this.parent[b], a);
      this.parent[b] = this.parent[a];
    } else {
      if (this.parent[a] != a)
        this.union(this.parent[a], b);
      this.parent[a] = this.parent[b];
    }
  }

  // Returns final parent of a node
  find(a) {
    while (this.parent[a] !== a) {
      a = this.parent[a];
    }
    return a;
  }

  // Checks connectivity of the 2 nodes
  connected(a, b) { return this.find(a) === this.find(b); }
}

// Class to represent cluster of points
class Cluster {
  points = [];
}

function genRandPoint(lowerBound = 0, upperBound = 100){
  return new Point([
    Math.floor(Math.random() * (upperBound + 1 - lowerBound)) + lowerBound,
    Math.floor(Math.random() * (upperBound + 1 - lowerBound)) + lowerBound
  ]);
}

/* Function utilizes minimum spanning tree algorithm to find clusters
 *
 * @param[in] point -- array of points to form clusters from
 * @param[in] k -- number of clusters to form
 * @param[in] distFunc -- function to compare two given points, function
 * parameter list must follow: (pointA, pointB) and must return a single
 * comparable value. Closer values with be clustered
 * */
function mstClustering(points, k, distFunc) {
  // init graph
  MST = new Graph();
  for (p1 of points) {
    MST.addNode(p1);
    for (let p2 of points) {
      if (p1.equals(p2)) {
        continue;
      }
      MST.addNode(p2);
      MST.addEdge(p1, p2, distFunc(p1, p2))
    }
  }

  MST = MST.kruskalsMST();

  for (let i = 0; i < k-1; ++i) {
    let maxEdge = MST.findLargestEdge();
    MST.deleteEdge(maxEdge);
  }

  let clusters = MST.cluster(k);

  return clusters;
}

function kMeansClustering(points, k, numIters, distFunc)
{
  // init graph
  MST = new Graph();
  for (p1 of points) {
    MST.addNode(p1);
    for (let p2 of points) {
      if (p1.equals(p2)) {
        continue;
      }
      MST.addNode(p2);
      MST.addEdge(p1, p2, distFunc(p1, p2))
    }
  }

  let clusters = MST.kMeansCluster(k, numIters, distFunc);

  return clusters;
}

function fromKey(key) { return new Point(key.split(',').map(x => +x)); }
function toKey(key) {return key.coordinates.toString();}

let failCase = [
  new Point([ 2, 16 ]), new Point([ 76, 17 ]), new Point([ 61, 25 ]),
  new Point([ 75, 17 ]), new Point([ 18, 9 ]), new Point([ 54, 70 ]),
  new Point([ 3, 52 ]), new Point([ 55, 43 ]), new Point([ 81, 46 ]),
  new Point([ 84, 33 ])
];

function distance(pointA, pointB) {
  let result = Math.sqrt(Math.pow(Math.abs(pointA.coordinates[0] - pointB.coordinates[0]), 2) +
                         Math.pow(Math.abs(pointA.coordinates[1] - pointB.coordinates[1]), 2));
  return result;
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

let color = [ "#ff5733", "#00FFFF", "#00FF00", "#FF00FF", "#0000FF" ];

let randPoints = [];
let NUMPOINTS = 100;

for (let i = 0; i < NUMPOINTS; ++i)
{
  randPoints.push(genRandPoint());
}

randPoints.forEach(p => { console.log(p.coordinates); });

let clusters = mstClustering(randPoints, 3, distance);
// let kMeansClusters = kMeansClustering(randPoints, 5, 100, distance);
// let clusters = kMeansClusters["clusters"];

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

clusters.forEach(c => {
  console.log(c);
})
