class Graph {
   constructor() {
      this.edges = {};
      this.nodes = [];
   }

   addNode(node) {
      this.nodes.push(node);
      this.edges[node] = [];
   }

   addEdge(node1, node2, weight = 1) {
      this.edges[node1].push({ node: node2, weight: weight });
      this.edges[node2].push({ node: node1, weight: weight });
   }

   addDirectedEdge(node1, node2, weight = 1) {
      this.edges[node1].push({ node: node2, weight: weight });
   }

   // return dictionary contained two nodes with the heighest edge weight in the
   // graph
   findLargestEdge() {
     let max = Number.MIN_VALUE;
     var maxEdge;
     for (var key in this.edges) {
       if (this.edges[key].weight > max) {
         max = this.edges[key].weight;
         maxEdge = {
           node1 : key,
           node2 : this.edges[key].node2,
           weight : this.edges[key].weight
         };
       }
     }

     return maxEdge;
  }

  deleteEdge(edge)
  {
    let index = this.edges[edge.node1].indexOf(
        {node : edge.node2, weight : edge.weight});
    if (index != undefined)
    {
      delete this.edges[edge.node1][index];
    }
    index = this.edges[edge.node2].indexOf(
        {node : edge.node1, weight : edge.weight});
    if (index != undefined)
    {
      delete this.edges[edge.node2][index];
    }
  }

  cluster(k)
  {
    let clusters = [];
    let indicies = [...Array(this.nodes.length).keys()];
    let currentCluster = 0;
    clusters[currentCluster] = [];
    clusters[currentCluster].push(this.nodes[0]);
    let lastNode = this.nodes[0];
    indicies.spice(0, 1);
    while (currentCluster < k)
    {
      let currentEdge = this.edges[lastNode];
      let nextNode = lastNode;
      if (currentEdge == undefined)
      {
        ++currentCluster;
        nextNode = this.nodes[indicies[0]];
      }
      else{
        nextNode = currentEdge.node;
      }

      clusters[currentCluster].push(nextNode);
      indicies.spice(this.nodes.indexOf(nextNode));
      lastNode = nextNode;
    }

    return clusters;
  }

   display() {
      let graph = "";
      this.nodes.forEach(node => {
         graph += node + "->" + this.edges[node].map(n => n.node).join(", ") + "\n";
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

      // Add all edges from this starting node to the PQ taking weights as priority
      this.edges[s].forEach(edge => {
         edgeQueue.enqueue([s, edge.node], edge.weight);
      });

      // Take the smallest edge and add that to the new graph
      let currentMinEdge = edgeQueue.dequeue();
      while (!edgeQueue.isEmpty()) {
         // COntinue removing edges till we get an edge with an unexplored node
         while (!edgeQueue.isEmpty() && explored.has(currentMinEdge.data[1])) {
            currentMinEdge = edgeQueue.dequeue();
         }
         let nextNode = currentMinEdge.data[1];
         // Check again as queue might get empty without giving back unexplored element
         if (!explored.has(nextNode)) {
            MST.addNode(nextNode);
            MST.addDirectedEdge(currentMinEdge.data[0], nextNode, currentMinEdge.priority);

            // Again add all edges to the PQ
            this.edges[nextNode].forEach(edge => {
               edgeQueue.enqueue([nextNode, edge.node], edge.weight);
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
            edgeQueue.enqueue([node, edge.node], edge.weight);
         });
      }
      let uf = new UnionFind(this.nodes);

      // Loop until either we explore all nodes or queue is empty
      while (!edgeQueue.isEmpty()) {
         // Get the edge data using destructuring
         let nextEdge = edgeQueue.dequeue();
         let nodes = nextEdge.data;
         let weight = nextEdge.priority;

         if (!uf.connected(nodes[0], nodes[1])) {
            MST.addDirectedEdge(nodes[0], nodes[1], weight);
            uf.union(nodes[0], nodes[1]);
         }
      }
      return MST;
   }
}

class UnionFind {
   constructor(elements) {
      // Number of disconnected components
      this.count = elements.length;

      // Keep Track of connected components
      this.parent = {};
      // Initialize the data structure such that all elements have themselves as parents
      elements.forEach(e => (this.parent[e] = e));
   }

   union(a, b) {
      let rootA = this.find(a);
      let rootB = this.find(b);

      // Roots are same so these are already connected.
      if (rootA === rootB) return;

      // Always make the element with smaller root the parent.
      if (rootA < rootB) {
         if (this.parent[b] != b) this.union(this.parent[b], a);
         this.parent[b] = this.parent[a];
      } else {
         if (this.parent[a] != a) this.union(this.parent[a], b);
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
   connected(a, b) {
      return this.find(a) === this.find(b);
   }
}

// Class to represent cluster of points
class Cluster {
  points = [];
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
  for (let p1 in points) {
    MST.addNode(p1);
    for (let p2 in points) {
      if (p1.equals(p2)) {
        continue;
      }
      MST.addEdge(p1, p2, distFunc(p1, p2))
    }
  }

  MST = MST.kruskalsMST;

  for (let i = 0; i < k;++i){
    let maxEdge = MST.findLargestEdge();
    MST.deleteEdge(maxEdge);
  }

  let clusters = MST.cluster();

  return clusters;
}

let vertexes = [
    [0,1],
    [0,4],
    [0,3],
    [10,10],
    [1,1]
];

function distance(pointA, pointB) {
  diffsSquared += Math.pow((pointA[dims[d]] - pointB[dims[d]]), 2);
}
let clusters = mstClustering(vertexes, 3, distance);
document.writeln(clusters);
