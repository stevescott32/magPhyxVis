function plotData(data, selectTag = null, title = 'default', xAxis = 'default',
                  yAxis = 'default') 
{
  let svgWidth = 1000;
  let svgHeight = 800;
  let margin = 100;
  let width = svgWidth - 2 * margin;
  let height = svgHeight - 2 * margin;
  let xAxisLabel = xAxis;
  let yAxisLabel = yAxis;
  let titleLabel = title;
  if (selectTag == null) {
    selectTag = 'svg#scatter_area';
  }

  let svg =
      d3.select(selectTag).attr('width', svgWidth).attr('height', svgHeight);
  let barChart =
      svg.html('').append('g').attr('transform', `translate(${margin}, ${margin})`);
  let yScale = d3.scaleLinear().range([ height, 0 ]).domain([
    Math.floor(Math.min(...data.map(d => d.y))),
    Math.ceil(Math.max(...data.map(d => d.y)))
  ]);
  let xScale = d3.scaleLinear().range([ 0, width ]).domain([
    0, Math.ceil(Math.max(...data.map(d => d.x)))
  ]);

  barChart.append('g').style('font-size', '10px').call(d3.axisLeft(yScale));

  barChart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .style('font-size', '12px')
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

  svg.selectAll("circle")
      .data(data)
      .enter()
      .append('circle')
      .attr("cx", d => xScale(d.x) + margin)
      .attr("cy", d => yScale(d.y) + margin)
      .attr("r", 5)
      .attr("fill", d => d.color);

  svg.append('text')
      .attr('x', -(height / 2) - margin)
      .attr('y', margin / 2.8)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .text(yAxisLabel)

  svg.append('text')
      .attr('x', width / 2 + margin)
      .attr('y', height + margin + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .text(xAxisLabel)

  svg.append('text')
      .attr('x', width / 2 + margin)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '30px')
      .text(titleLabel)
}

class Graph {
  constructor() {
    this.edges = {};
    this.nodes = [];
  }

  addNode(node) {
    // if (this.nodes.includes(node)) {
    //   return;
    // }
    this.nodes.push(node);
    this.edges[node] = [];
  }

  addEdge(node1, node2, weight = 1) {
    this.edges[node1].push({node : node2, weight : weight});
    // this.edges[node2].push({node : node1, weight : weight});
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
      let candidate = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      if (clusterOrigins.includes(candidate))
      {
        --j;
      }
      else{
        clusterOrigins.push(candidate);
      }

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
          // console.log("distance: ", distToOrigin, " index: ", index);
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
    lapMat[i] = new Array(N).fill(0);
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
    if (sample.events.some(e => e.on == true))
    {
      cleanData.push(sample);
    }
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
  let vec = orders.vectors[1];
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

function clearNan(matrix) {
  let rows = matrix.length;
  if (rows == 0) {
    return matrix;
  }

  let cols = matrix[0].length;

  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      if (isNaN(matrix[i][j])) {
        matrix[i][j] = 0;
      }
    }
  }

  return matrix;
}

function normLapMat(mat)
{
  let rows = mat.length;
  if (rows == 0) {
    return mat;
  }

  let cols = mat[0].length;

  for (let i = 0; i < rows; ++i) {
    let degValue = mat[i][i];
    mat[i][i] = 1;
    for (let j = i; j < cols; ++j) {
      mat[i][j] = -1 * (mat[i][j] / degValue);
      mat[j][i] = mat[i][j];
    }
  }

  return mat;
}

function genDegreeMatrix(matrix, setToOne = false) {
  let N = matrix[0].length;
  let degMat = new Array(N);
  for (let i = 0; i < N; ++i) {
    degMat[i] = new Array(N).fill(0);
  }

  for (var rowIdx = 0; rowIdx < N; ++rowIdx) {
    if (setToOne)
    {
      degMat[rowIdx][rowIdx] = matrix[rowIdx].reduce(function(t, v) {
        if (v != 0)
          return t + 1;
        else
          return t;
      }, 0);
    }
    else
    {
      degMat[rowIdx][rowIdx] =
          matrix[rowIdx].reduce(function(t, v) { return t + v; }, 0);
    }
  }

  return degMat;
}

function genAdjacencyMatrix(matrix, threshold = 0, setToOne = false)
{
  let N = matrix[0].length;
  let adjMat = new Array(N);
  for (let i = 0; i < N; ++i) {
    adjMat[i] = new Array(N).fill(0);
  }

  for (var rowIdx = 0; rowIdx < N; ++rowIdx) {
    for (var colIdx = 0; colIdx < N; ++colIdx) {
      let element = matrix[rowIdx][colIdx];
      if (element < threshold && element != 0) {
        if (setToOne) {
          adjMat[rowIdx][colIdx] = 1;
        } else {
          adjMat[rowIdx][colIdx] += element;
        }
      }
    }
  }

  return adjMat;

}

function createTable(data, tableID = 'Default Table ID') {

  // CREATE DYNAMIC TABLE.
  var table = document.createElement('table');

  // SET THE TABLE ID.
  // WE WOULD NEED THE ID TO TRAVERSE AND EXTRACT DATA FROM THE TABLE.
  table.setAttribute('id', tableID);
  table.setAttribute('class', 'table');

  for (var rowIdx = 0; rowIdx <= data.length - 1; rowIdx++) {
    tr = table.insertRow(-1);

    for (var colIdx = 0; colIdx < data[0].length; colIdx++) {
      var td = document.createElement('td'); // TABLE DEFINITION.
      td = tr.insertCell(-1);
      cellValue = 100 * data[rowIdx][colIdx].toFixed(2); // ADD VALUES TO EACH CELL.
      td.setAttribute('class', 'v' + cellValue);
      td.style.backgroundColor = 'hsl(' + (300 * (cellValue/100)) + ', 100%, 50%)';
      td.innerHTML = cellValue; // ADD VALUES TO EACH CELL.
    }
  }

  document.body.appendChild(table);
}

function createMatrixImage(matrix) {
  var canvas = document.createElement("canvas");
  let width = matrix[0].length;
  let height = matrix[0].length;
  canvas.width = width;
  canvas.height = height;
  // getting the context will allow to manipulate the image
  var context = canvas.getContext("2d");
  context.scale(10, 10);

  // We create a new imageData.
  var imageData = context.createImageData(width, height);
  // The property data will contain an array of int8
  var data = imageData.data;
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      data[((i * width) + j) * 4 + 0] = (1 - matrix[j][i]) * 256 | 0; // Red
      data[((i * width) + j) * 4 + 1] = (1 - matrix[j][i]) * 256 | 0; // Green
      data[((i * width) + j) * 4 + 2] = (1 - matrix[j][i]) * 256 | 0; // Blue
      data[((i * width) + j) * 4 + 3] = 90; // alpha (transparency)
    }
  }

  // we put this random image in the context
  context.putImageData(imageData, 0, 0); // at coords 0,0

  var img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");
  document.body.appendChild(img);
}

function vectorToCoords(vector)
{
  let coords = [];
  for (var i = 0; i < vector.length; ++i)
  {
    coords.push({"x": i, "y": vector[i]});
  }

  return coords;
}

function tieIndexToArray(inputArray)
{
  let data = [];

  for (var i = 0; i < inputArray.length; ++i)
  {
    sample = {
      'index': i,
      'value': inputArray[i]
    };
    data.push(sample);
  }

  return data;
}

function normValues(matrix, max) {
  let N = matrix[0].length;

  for (let i = 0; i < N; ++i) {
    for (let j = 0; j < N; ++j) {
      matrix[i][j] = matrix[i][j] / max;
    }
  }

  return matrix;
}

function genAffinityMatrix(data, distFunc)
{
  let N = data.length;
  let adjMat = new Array(N);
  for (let i = 0; i < N; ++i)
  {
    adjMat[i] = new Array(N).fill(0);
  }

  let max = 0;

  for (var i = 0 ; i < N; ++i)
  {
    for (var j = i ; j < N; ++j)
    {
      let dist = distFunc(data[i],data[j]);

      if (dist > max)
      {
        max = dist;
      }
      adjMat[i][j] = dist;
      adjMat[j][i] = dist;
    }
  }

  adjMat = normValues(adjMat, max);

  return adjMat;
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

  // let orderArray = [
  //   12, 16,  20,  21,  29,  31,  41,  59,  130, 131, 142, 143, 3,   8,
  //   10, 13,  14,  18,  22,  23,  24,  25,  26,  32,  35,  38,  49,  56,
  //   58, 126, 127, 128, 129, 133, 134, 135, 136, 138, 141, 1,   4,   5,
  //   42, 43,  44,  45,  50,  52,  62,  67,  69,  74,  76,  80,  82,  83,
  //   88, 91,  92,  95,  98,  99,  100, 102, 103, 104, 110, 116, 119, 140,
  //   47, 79,  89,  90,  93,  115, 125, 0,   2,   6,   7,   9,   11,  17,
  //   27, 28,  30,  33,  34,  36,  37,  39,  40,  46,  48,  51,  53,  54,
  //   55, 57,  60,  61,  63,  64,  132, 137, 139,
  // ];

  // points = defineOrder(points, orderArray);
  let indicies = [...Array(points.length).keys() ];

  //shuffle
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = points[i];
    points[i] = points[j];
    points[j] = temp;
  }

  // init graph
  MST = new Graph();
  for (p1 of indicies) {
    MST.addNode(p1);
    for (let p2 of indicies) {
      if (p1 == (p2)) {
        continue;
      }
      MST.addEdge(p1, p2, distFunc(points[p1], points[p2]))
    }
  }

  // MST = MST.kruskalsMST();
  // MST = MST.kNeighbors(6);

  let affMat = MST.genAffinityMatrix(distFunc);

  createTable(affMat, "AffMat");

  let adjMat = genAdjacencyMatrix(affMat, 0.5);

  let degMat = genDegreeMatrix(adjMat);

  let lapMat = minMats(degMat, adjMat);

  let ans = math.eigs(lapMat);

  // ====================================================================
  // we create a canvas element
  {
    var canvas = document.createElement("canvas");
    let width = affMat[0].length;
    let height = affMat[0].length;
    canvas.width = width;
    canvas.height = height;
    // getting the context will allow to manipulate the image
    var context = canvas.getContext("2d");
    context.scale(10,10);

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

  // let rowLapMat = sumRowMat(affMat);

  // let sqrtLapMat = math.sqrt(rowLapMat);

  // let invSqrtLapMat = invertLapMat(sqrtLapMat);

  // let LA = math.multiply(invSqrtLapMat, affMat);

  // let LAL = math.multiply(LA, invSqrtLapMat);

  // LAL = clearNan(LAL);

  // ans = math.eigs(LAL);

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
        MST.addEdge(p1, p2, distFunc(points[p1], points[p2]))
      }
    }
    // MST = MST.kNeighbors(30);

    let affMat = MST.genAffinityMatrix(distFunc);

    // we create a canvas element
    var canvas = document.createElement("canvas");
    let width = affMat[0].length;
    let height = affMat[0].length;
    canvas.width = width;
    canvas.height = height;
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

  return;
  // ====================================================================

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

  // for (let i = 0; i < k - 1; ++i) {
  //   let maxEdge = MST.findLargestEdge();
  //   MST.deleteEdge(maxEdge);
  // }

  // let clusters = MST.cluster(k);

  // return clusters;
  return [];
}

function multiDimensionalEuclidsDist(a,b)
{
  let sum = 0;
  for (var i = 0; i < a.length; ++i)
  {
    sum += (a[i] - b[i]) * (a[i] - b[i]);
  }

  return Math.sqrt(sum);
}

function newSpectralClustering(points, k, distFunc) {
  points = cleanData(points);
  let indicies = [...Array(points.length).keys() ];

  // plotData(points, "svg#scatter_points", "Initial Points");

  //shuffle
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = points[i];
    points[i] = points[j];
    points[j] = temp;
  }

  // init graph
  MST = new Graph();
  for (p1 of indicies) {
    MST.addNode(p1);
    for (let p2 of indicies) {
      if (p1 == (p2)) {
        continue;
      }
      MST.addEdge(p1, p2, distFunc(points[p1], points[p2]))
    }
  }

  // Kmeans Clustering =========================================
  // let clusters = kMeansClustering(points, k, 10, distFunc);
  // let orderedData = [];
  // let colorScale = ['red', 'blue', 'green', 'black', 'cyan'];
  // for (var i = 0; i < clusters.clusters.length; ++i)
  // {
  //   let tempData = clusters.clusters[i];

  //   for (let data of tempData)
  //   {
  //     data['color'] = colorScale[i];
  //   }

  //   orderedData = orderedData.concat(tempData);

  // }
  // END Kmeans Clustering =========================================

  // Spectral Clustering ==========================================
  // MST = MST.kruskalsMST();
  // MST = MST.kNeighbors(6);

  let affMat = MST.genAffinityMatrix(distFunc);

  createMatrixImage(affMat);

  // createTable(affMat, "AffMat");

  let adjMat = genAdjacencyMatrix(affMat, 0.50);
  // let adjMat = [
  //   [0,1,0,0,0,0,0,0,0,0],
  //   [1,0,1,0,1,0,1,1,0,1],
  //   [0,1,0,0,0,1,1,0,1,1],
  //   [0,0,0,0,1,1,0,0,1,0],
  //   [0,1,0,1,0,1,1,1,0,1],
  //   [0,0,1,1,1,0,1,0,1,0],
  //   [0,1,1,0,1,1,0,1,1,0],
  //   [0,1,0,0,1,0,1,0,0,0],
  //   [0,0,1,1,0,1,1,0,0,1],
  //   [0,1,1,0,1,0,0,0,1,0],
  // ]

  // createTable(adjMat);

  let degMat = genDegreeMatrix(adjMat);

  // createTable(degMat);

  let lapMat = minMats(degMat, adjMat);

  // lapMat = normLapMat(lapMat);

  // createTable(lapMat);

  let ans = math.eigs(lapMat);

  let vect1 = ans.vectors.map(d => d[k]);

  let eigenVector = tieIndexToArray(vect1);

  // let vectorCoords = vectorToCoords(ans.vectors[1].sort((a,b) => a - b));
  let vectorCoords = vectorToCoords(vect1.sort((a,b) => a - b));

  plotData(vectorToCoords(ans.values),"svg#scatter_values", "Eigen Values");
  plotData(vectorCoords,"svg#scatter_area", "Eigen Vector");

  let clusters = kMeansClusteringVector(eigenVector, k, 50, function(a, b) {
    return Math.abs(a.value - b);
  });

  let orderedData = [];
  var colorScale = [
    'grey', 'orange', 'red', 'brown', 'blue', 'purple', 'green', 'pink',
    'grey', 'orange', 'red', 'brown', 'blue', 'purple', 'green',
    'pink', 'black'
  ];
  for (var i = 0; i < clusters.clusters.length; ++i)
  {
    let tempData = defineOrder(points, clusters.clusters[i].map(d => d.index));

    for (let data of tempData)
    {
      data['color'] = colorScale[i];
    }

    orderedData = orderedData.concat(tempData);

  }
  // END Spectral Clustering ==========================================

  // plotData(orderedData, "svg#clusters", "Clusters");

  let resMat = genAffinityMatrix(orderedData, distFunc);

  createMatrixImage(resMat);

  return orderedData;
}

function kMeansClusteringNVector(points, k, numIters, distFunc) {
  // Init cluster origins
  let clusterOrigins = [];
  let clusters = [];
  let step = 2/k;

  for (let j = 0; j < k; ++j) {
      clusterOrigins.push(-1 + (j * step));
  }

  for (let i = 0; i < numIters; ++i) {
    clusters = [];
    for (let origin of clusterOrigins) {
      clusters.push([]);
    }
    // add points to appropriate cluster
    for (let point of points) {
      let minDist = Number.MAX_VALUE;
      let destIndex = -1;
      clusterOrigins.forEach(function(origin, index, clusterOrigins) {
        let distToOrigin = distFunc(point, origin);
        if (distToOrigin < minDist) {
          minDist = distToOrigin;
          destIndex = index;
        }
      });
      clusters[destIndex].push(point);
    }


    // Find new clusterOrigins
    clusterOrigins = [];
    for (let cluster of clusters) {
      let minDist = Number.MAX_VALUE;
      var clusterOrigin;
      let mean = Array(cluster[0].value.length);

      for (let point of cluster) {
        for(let i = 0; i < point.value.length; ++i)
          mean[i] += point.value[i];
      }

      if (mean != 0)
      {
        for(let i = 0; i < mean.length; ++i)
          mean[i] = mean[i] / cluster.length;
      }

      clusterOrigins.push(mean);
    }
  }

  return {"clusters" : clusters, "clusterOrigins" : clusterOrigins};
}

function kMeansClusteringVector(points, k, numIters, distFunc) {
  // Init cluster origins
  let clusterOrigins = [];
  let clusters = [];
  let step = 2/k;

  for (let j = 0; j < k; ++j) {
      clusterOrigins.push(-1 + (j * step));
  }

  for (let i = 0; i < numIters; ++i) {
    clusters = [];
    for (let origin of clusterOrigins) {
      clusters.push([]);
    }
    // add points to appropriate cluster
    for (let point of points) {
      let minDist = Number.MAX_VALUE;
      let destIndex = -1;
      clusterOrigins.forEach(function(origin, index, clusterOrigins) {
        let distToOrigin = distFunc(point, origin);
        if (distToOrigin < minDist) {
          minDist = distToOrigin;
          destIndex = index;
        }
      });
      clusters[destIndex].push(point);
    }


    // Find new clusterOrigins
    clusterOrigins = [];
    for (let cluster of clusters) {
      let minDist = Number.MAX_VALUE;
      var clusterOrigin;
      let mean = 0;

      for (let point of cluster) {
        mean += point.value;
      }

      if (mean != 0)
      {
        mean = mean/cluster.length;
      }

      clusterOrigins.push(mean);
    }
  }

  return {"clusters" : clusters, "clusterOrigins" : clusterOrigins};
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
function kMeansClustering(points, k, numIters, distFunc) {
  // points = cleanData(points);

  // init graph
  MST = new Graph();
  for (var i = 0; i < points.length; ++i) {
    let p1 = points[i];
    MST.addNode(p1);
    for (var j = 0; j < points.length; ++j) {
      if (i == j) {
        continue;
      }
      let p2 = points[j];
      MST.addEdge(p1, p2, distFunc(p1, p2));
    }
  }

  let clusters = MST.kMeansCluster(k, numIters, distFunc);

  let orderedData = [];
  for (let cluster of clusters.clusters)
  {
    orderedData = orderedData.concat(cluster);
  }

  let resMat = genAffinityMatrix(orderedData, distFunc);

  createMatrixImage(resMat);

  return clusters;
}
