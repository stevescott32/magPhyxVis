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
    this.edges[node] = [];
  }

  addEdge(node1, node2, weight = 1) {
    this.edges[node1].push({node : node2, weight : weight});
    this.edges[node2].push({node : node1, weight : weight});
  }

  addDirectedEdge(node1, node2, weight = 1) {
    this.edges[node1].push({node : node2, weight : weight});
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
          node1 : key,
          node2 : edge.node,
          weight : edge.weight
        };
      }
    }

    return maxEdge;
  }

  deleteEdge(edge) {
    let index = this.edges[edge.node1].forEach(function(e, index,
                                                        edgeArray) {
      if (this.isEdgeEqual(e, {node : edge.node2, weight : edge.weight})) {
        edgeArray.splice(index, 1);
      }
    }.bind(this));

     index = this.edges[edge.node2].forEach(function(e, index,
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
      let nextEdges = this.edges[nextNode];
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
      let currentEdge = this.edges[currNode];
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
        edgeQueue.enqueue([ Number(node), edge.node ], edge.weight);
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

  kNeighbors(k)
  {
    const MST = new Graph();

    this.nodes.forEach(node => MST.addNode(node));
    if (this.nodes.length === 0) {
      return MST;
    }

    for (var key in this.edges)
    {
      let sorted =
          this.edges[key].sort((a, b) => a.weight > b.weight).slice(0, k);

      for (var edge of sorted)
      {
        MST.addEdge(Number(key), edge.node, edge.weight);
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
      clusterOrigins.push(
          this.nodes[Math.floor(Math.random() * this.nodes.length)]);
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
          console.log("distance: ", distToOrigin, " index: ", index);
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

  genAdjacencyMatrix()
  {
    let N = this.nodes.length;
    let adjMat = new Array(N);
    for (let i = 0; i < N; ++i)
    {
      adjMat[i] = new Array(N).fill(0);
    }

    for (var key in this.edges) {
      for (var edge of this.edges[key]) {
        adjMat[key][edge.node] = 1;
        adjMat[edge.node][key] = 1;
      }
    }

    return adjMat;
  }

  genDegreeMatrix()
  {
    let N = this.nodes.length;
    let degMat = new Array(N);
    for (let i = 0; i < N; ++i)
    {
      degMat[i] = new Array(N).fill(0);
    }

    for (var key in this.edges) {
      for (var edge of this.edges[key]) {
        if (edge.weight != 0)
        {
          degMat[key][key] += 1;
          degMat[edge.node][edge.node] += 1;
        }
      }
    }

    return degMat;
  }

  normValues(matrix, max)
  {
    let N = matrix[0].length;

    for (let i = 0; i < N; ++i) {
      for (let j = 0; j < N; ++j) {
        matrix[i][j] = matrix[i][j] / max;
      }
  }

    return matrix;
  }

  genAffinityMatrix(distFunc)
  {
    let N = this.nodes.length;
    let adjMat = new Array(N);
    for (let i = 0; i < N; ++i)
    {
      adjMat[i] = new Array(N).fill(0);
    }

    let max = 0;

    for (var key in this.edges) {
      for (var edge of this.edges[key]) {
        if (edge.weight > max)
        {
          max = edge.weight;
        }
        adjMat[key][edge.node] = edge.weight;
        adjMat[edge.node][key] = edge.weight;
      }
    }

    adjMat = this.normValues(adjMat, max);

    return adjMat;
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

function minMats(aMat, bMat)
{
  let N = aMat[0].length;
  let lapMat = new Array(N);
  for (let i = 0; i < N; ++i) {
    lapMat[i] = new Array(N);
  }

  for (let i = 0; i < N; ++i)
  {
    for (let j = 0; j < N; ++j)
    {
      lapMat[i][j] = aMat[i][j] - bMat[i][j]
    }
  }

  return lapMat;
}

/* Function utilizes minimum spanning tree algorithm to find clusters
 *
 * @param[in] points -- array of points to form clusters from
 * @param[in] k -- number of clusters to form
 * @param[in] distFunc -- function to compare two given points, function
 * parameter list must follow: (pointA, pointB) and must return a single
 * comparable value. Closer values with be clustered
 * */
function mstClustering(points, k, distFunc) {
  let indicies = [...Array(points.length).keys() ];

  // init graph
  MST = new Graph();
  for (p1 of indicies) {
    MST.addNode(p1);
    for (let p2 of indicies) {
      if (p1 == (p2)) {
        continue;
      }
      MST.addNode(p2);
      MST.addEdge(p1, p2, distFunc(points[p1], points[p2]))
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

function invertLapMat(srcMat)
{
  let N = srcMat[0].length;
  let rowLapMat = new Array(N);
  for (let i = 0; i < N; ++i) {
    rowLapMat[i] = new Array(N).fill(0);
  }

  for (let i = 0; i < N; ++i)
  {
    rowLapMat[i][i] = (1/srcMat[i][i]);
  }

  return rowLapMat;
}

function sumRowMat(srcMat)
{
  let N = srcMat[0].length;
  let rowLapMat = new Array(N);
  for (let i = 0; i < N; ++i) {
    rowLapMat[i] = new Array(N).fill(0);
  }

  for (let i = 0; i < N; ++i)
  {
    rowLapMat[i][i] = 0;
    for (let j = 0; j < N; ++j)
    {
      rowLapMat[i][i] += srcMat[i][j];
    }
  }

  return rowLapMat;
}

function cleanData(data)
{
  let cleanData = [];
  for (let sample of data)
  {
    if (sample.events.length == 0)
    {
      continue;
    }
    cleanData.push(sample);
  }

  return cleanData;
}

function defineOrder(data, order)
{
  let orderedData = Array(order.length);

  let counter = 0;
  for (let index of order)
  {
    orderedData[counter] = data[index];
    ++counter;
  }

  return orderedData;
}

function reorderFromVector(orders, data)
{
  let vec = orders.vectors[106];
  let taggedVec = Array(vec.length);

  let counter =0;
  for (let sample of vec)
  {
    taggedVec[counter] = {"value": sample, "index": counter};
    ++counter;
  }

  taggedVec.sort((a, b) => a["value"] - b["value"]);

  let orderedVec = [];
  let displayVec = [];
  for (let sample of taggedVec)
  {
    orderedVec.push(sample["index"]);
    displayVec.push(sample["value"]);
  }

  console.log(displayVec);

  return orderedVec;
}

function clearNan(matrix)
{
  let rows = matrix.length;
  if (rows == 0)
  {
    return matrix;
  }

  let cols = matrix[0].length;

  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < rows; ++j) {
      if (isNaN(matrix[i][j])) {
        matrix[i][j] = 0;
      }
    }
  }

  return matrix;
}

/* Function utilizes minimum spanning tree algorithm and spectral clustering to
 * generate clusters
 *
 * @param[in] points -- array of points to form clusters from
 * @param[in] k -- number of clusters to form
 * @param[in] distFunc -- function to compare two given points, function
 * parameter list must follow: (pointA, pointB) and must return a single
 * comparable value. Closer values with be clustered
 * */
function spectralClustering(points, k, distFunc) {
  // points = cleanData(points);
  // let orderArray = [
  //   1,   2,   4,   6,   8,   27,  28,  42,  43,  44,  45,  48,  50,  52,
  //   61,  62,  83,  88,  99,  100, 110, 3,   9,   10,  12,  13,  14,  16,
  //   17,  18,  20,  21,  22,  23,  24,  25,  26,  29,  31,  32,  33,  35,
  //   36,  37,  38,  39,  40,  41,  46,  47,  49,  56,  58,  59,  79,  89,
  //   90,  93,  115, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135,
  //   136, 137, 138, 139, 141, 142, 143, 5,   30,  57,  67,  69,  74,  76,
  //   80,  82,  91,  92,  95,  98,  102, 103, 104, 116, 119, 140, 0,   7,
  //   11,  34,  51,  53,  54,  55,  60,  63,  64,
  // ];

  let orderArray = [
    12, 16,  20,  21,  29,  31,  41,  59,  130, 131, 142, 143, 3,   8,
    10, 13,  14,  18,  22,  23,  24,  25,  26,  32,  35,  38,  49,  56,
    58, 126, 127, 128, 129, 133, 134, 135, 136, 138, 141, 1,   4,   5,
    42, 43,  44,  45,  50,  52,  62,  67,  69,  74,  76,  80,  82,  83,
    88, 91,  92,  95,  98,  99,  100, 102, 103, 104, 110, 116, 119, 140,
    47, 79,  89,  90,  93,  115, 125, 0,   2,   6,   7,   9,   11,  17,
    27, 28,  30,  33,  34,  36,  37,  39,  40,  46,  48,  51,  53,  54,
    55, 57,  60,  61,  63,  64,  132, 137, 139,
  ];

  points = defineOrder(points, orderArray);
  let indicies = [...Array(points.length).keys() ];

  // init graph
  MST = new Graph();
  for (p1 of indicies) {
    MST.addNode(p1);
    for (let p2 of indicies) {
      if (p1 == (p2)) {
        continue;
      }
      MST.addNode(p2);
      MST.addEdge(p1, p2, distFunc(points[p1], points[p2]))
    }
  }

  // MST = MST.kruskalsMST();
  // MST = MST.kNeighbors(3);

  // let adjMat = MST.genAdjacencyMatrix();

  // let degMat = MST.genDegreeMatrix();

  let affMat = MST.genAffinityMatrix(distFunc);

  // ====================================================================
  // we create a canvas element
  {
    var canvas = document.createElement("canvas");
    let width = 100;
    let height = 100;
    canvas.width = 100;
    canvas.height = 100;
    // getting the context will allow to manipulate the image
    var context = canvas.getContext("2d");

    // We create a new imageData.
    var imageData = context.createImageData(width, height);
    // The property data will contain an array of int8
    var data = imageData.data;
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        data[((i * width) + j) * 4 + 0] = (1 - affMat[j][i]) * 256 | 0; // Red
        data[((i * width) + j) * 4 + 1] = (1 - affMat[j][i]) * 256 | 0; // Green
        data[((i * width) + j) * 4 + 2] = (1 - affMat[j][i]) * 256 | 0; // Blue
        data[((i * width) + j) * 4 + 3] = 90; // alpha (transparency)
      }
    }

    // we put this random image in the context
    context.putImageData(imageData, 0, 0); // at coords 0,0

    var img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    document.body.appendChild(img);
  }
  // ====================================================================

  let rowLapMat = sumRowMat(affMat);

  let sqrtLapMat = math.sqrt(rowLapMat);

  let invSqrtLapMat = invertLapMat(sqrtLapMat);

  let LA = math.multiply(invSqrtLapMat, affMat);

  let LAL = math.multiply(LA, invSqrtLapMat);

  LAL = clearNan(LAL);

  let ans = math.eigs(LAL);

  // ====================================================================
  {
    let orderArray = reorderFromVector(ans, points);
    points = defineOrder(points, orderArray);

    MST = new Graph();
    for (p1 of indicies) {
      MST.addNode(p1);
      for (let p2 of indicies) {
        if (p1 == (p2)) {
          continue;
        }
        MST.addNode(p2);
        MST.addEdge(p1, p2, distFunc(points[p1], points[p2]))
      }
    }
    // MST = MST.kNeighbors(30);

    let affMat = MST.genAffinityMatrix(distFunc);

    // we create a canvas element
    var canvas = document.createElement("canvas");
    let width = 100;
    let height = 100;
    canvas.width = 100;
    canvas.height = 100;
    // getting the context will allow to manipulate the image
    var context = canvas.getContext("2d");

    // We create a new imageData.
    var imageData = context.createImageData(width, height);
    // The property data will contain an array of int8
    var data = imageData.data;
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        data[((i * width) + j) * 4 + 0] = (1 - affMat[j][i]) * 256 | 0; // Red
        data[((i * width) + j) * 4 + 1] = (1 - affMat[j][i]) * 256 | 0; // Green
        data[((i * width) + j) * 4 + 2] = (1 - affMat[j][i]) * 256 | 0; // Blue
        data[((i * width) + j) * 4 + 3] = 90; // alpha (transparency)
      }
    }

    // we put this random image in the context
    context.putImageData(imageData, 0, 0); // at coords 0,0

    var img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    document.body.appendChild(img);
  }
  // ====================================================================

  // let lapMat = minMats(degMat, adjMat);

  // let ans = math.eigs(lapMat);

  let testMat = [
    [ 4, -1, -1, 0, 0, -1, 0, 0, -1, -1 ],
    [ -1, 2, -1, 0, 0, 0, 0, 0, 0, 0 ],
    [ -1, -1, 2, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 2, -1, -1, 0, 0, 0, 0 ],
    [ 0, 0, 0, -1, 2, -1, 0, 0, 0, 0 ],
    [ -1, 0, 0, -1, -1, 4, -1, -1, 0, 0 ],
    [ 0, 0, 0, 0, 0, -1, 2, -1, 0, 0 ],
    [ 0, 0, 0, 0, 0, -1, -1, 2, 0, 0 ],
    [ -1, 0, 0, 0, 0, 0, 0, 0, 2, -1 ],
    [ -1, 0, 0, 0, 0, 0, 0, 0, -1, 2 ],
  ];
  let testAns = math.eigs(testMat);
  // const H = [[5, 2.3], [2.3, 1]];
  // const ans = math.eigs(H);

  console.log(math.sqrt(-4).toString());

  for (let i = 0; i < k - 1; ++i) {
    let maxEdge = MST.findLargestEdge();
    MST.deleteEdge(maxEdge);
    }

    let clusters = MST.cluster(k);

    return clusters;
}

/* Function utilizes kMeans algorithm to find clusters
 *
 * @param[in] points -- array of points to form clusters from
 * @param[in] k -- number of clusters to form
 * @param[in] numIters -- number of iterations to perform
 * @param[in] distFunc -- function to compare two given points, function
 * parameter list must follow: (pointA, pointB) and must return a single
 * comparable value. Closer values with be clustered
 * */
function kMeansClustering(points, k, numIters, distFunc)
{
  points = cleanData(points);

  // init graph
  MST = new Graph();
  for (p1 of points) {
    MST.addNode(p1);
    for (let p2 of points) {
      if (p1 == (p2)) {
        continue;
      }
      MST.addNode(p2);
      MST.addEdge(p1, p2, distFunc(p1, p2))
    }
  }

  let clusters = MST.kMeansCluster(k, numIters, distFunc);

  return clusters;
}
