
// finds connected components in graph given a list of edge
function union_find(edge_list) {
    const parent = {};

    const find_parent = (node) => {
        if (!parent[node]) {
            parent[node] = node;
        }
        if (parent[node] === node) {
            return node;
        }
        return parent[node] = find_parent(parent[node]);
    }

    const add_edge = (a, b) => {
        parent[find_parent(a)] = find_parent(b);
    };

    edge_list.forEach(edge => {
        add_edge(edge.a, edge.b)
    })

    const components = {};
    edge_list.forEach(edge => {
        [edge.a, edge.b].forEach(vertex => {
            const parent = find_parent(vertex)
            if (!(parent in components)) {
                components[parent] = new Set();
            }
            components[parent].add(vertex)
        })
    })

    return Object.values(components).map(component => Array.from(component));

}