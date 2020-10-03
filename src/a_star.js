// Pythagoras 
function heuristic(current_node, destination) {
    const x = current_node.x - destination.x;
    const y = current_node.y - destination.y;
    return Math.sqrt(x * x + y * y);
}

function node(id, x, y, parent_index, g, h, f) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.parent_index = parent_index; // nötig nur bei closed
    this.g = g; // Kosten vom start bis hier
    this.h = h; // Schätzung von hier bis Ziel
    this.f = f; // Gesamtkosten: g+h
}

export function a_star(startId, startX, startY, destinationId, destinationX, destinationY, graph, points) {
    //Create start and destination as true nodes
    var start = new node(startId, startX, startY, -1, -1, -1, -1);
    var destination = new node(destinationId, destinationX, destinationY, -1, -1, -1, -1);

    // List of open nodes (nodes to be inspected)
    var open = [];
    //List of closed nodes (nodes we've already inspected)
    var closed = [];

    var g = 0; //Cost from start to current node
    var h = heuristic(start, destination); //Cost from current node to destination
    var f = g + h; //Cost from start to destination going through the current node

    //Push the start node onto the list of open nodes
    open.push(start);
    //Keep going while there's nodes in our open list
    while (open.length > 0) {
        //Find the best open node (lowest f value)
        var best_cost = open[0].f;
        var best_node = 0;
        var test="open:"+open[0].id+"-";

        for (let i = 1; i < open.length; i++) {

            test+=open[i].id+"-";
            if (open[i].f < best_cost) {
                best_cost = open[i].f;
                best_node = i;
            }
        }
        // Set it as our current node
        var current_node = open[best_node];

        
        //console.log(test+">"+current_node.id);
        test="closed:";
        for (var i = 0; i < closed.length; i++) {
            test+=closed[i].id+"-";
        }
        //console.log(test);

        //Check if we've reached our destination
        if (current_node.id === destination.id) {
            var path = [destination]; //current_node.x == destination.x && current_node.y == destination.yInitialize the path with the destination node
            //Go up the chain to recreate the path 
            while (current_node.parent_index !== -1) {
                current_node = closed[current_node.parent_index];
                path.unshift(current_node);
            }
            return path;
        }

        //Remove the current node from our open list
        open.splice(best_node, 1);

        //Push it onto the closed list
        closed.push(current_node);
        // Expandieren heißt hier: Alle Nachbarknoten abklappern
        test = "";
        for (let n = 0; n < graph[current_node.id].length; n++) {
            if (graph[current_node.id]) {
                const newId = graph[current_node.id][n];

                let newNodeX;
                if(newId === startId) {
                    newNodeX = startX;
                } else {
                    if(newId === destinationId) {
                        newNodeX = destinationX;
                    } else {
                        newNodeX = points[newId].x;
                    }
                }
                let newNodeY;
                if(newId === startId) {
                    newNodeY = startY;
                } else {
                    if(newId === destinationId) {
                        newNodeY = destinationY;
                    } else {
                        newNodeY = points[newId].y;
                    }
                }

                //See if the node is already in our closed list. If so, skip it.
                let found_in_closed = false;
                for (let i in closed) {
                    if (closed[i].id == newId) {
                        found_in_closed = true;
                        break;
                    }
                }
                if (found_in_closed) {
                    continue;
                }

                //See if the node is in our open list. If not, use it.
                var found_in_open = false;
                for (let i in open) {
                    if (open[i].id == newId) {
                        found_in_open = true;
                        break;
                    }
                }
                if (!found_in_open) {
                    var new_node = new node(newId, newNodeX, newNodeY, closed.length - 1, -1, -1, -1);

                    new_node.g = current_node.g + Math.floor(Math.sqrt(Math.pow(new_node.x - current_node.x, 2) + Math.pow(new_node.y - current_node.y, 2)));
                    new_node.h = heuristic(new_node, destination);
                    new_node.f = new_node.g + new_node.h;
                    test += newId + "(f=" + new_node.f + ",)";
                    open.push(new_node);
                }
            }
        }
    }
    return [];
}