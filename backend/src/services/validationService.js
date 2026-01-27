/**
 * Validates automation flow structure and node configurations
 */

export function validateAutomation(automation) {
    const errors = [];
    const { nodes, edges } = automation;

    if (!nodes || nodes.length === 0) {
        errors.push('Automation must have at least one node');
        return errors;
    }

    // Check for exactly one Start and End node
    const startNodes = nodes.filter(n => n.type === 'start');
    const endNodes = nodes.filter(n => n.type === 'end');

    if (startNodes.length !== 1) {
        errors.push('Flow must have exactly one Start node');
    }
    if (endNodes.length !== 1) {
        errors.push('Flow must have exactly one End node');
    }

    // Validate node configurations
    nodes.forEach(node => {
        validateNode(node, errors);
    });

    // Validate edges
    if (edges && edges.length > 0) {
        validateEdges(nodes, edges, errors);
    }

    // Check connectivity
    if (startNodes.length === 1 && edges && edges.length > 0) {
        validateConnectivity(nodes, edges, startNodes[0], endNodes[0], errors);
    }

    return errors;
}

function validateNode(node, errors) {
    if (!node.id) {
        errors.push('Node is missing id');
        return;
    }

    switch (node.type) {
        case 'action':
            if (!node.data || !node.data.message || node.data.message.trim() === '') {
                errors.push(`Action node ${node.id} is missing message`);
            }
            break;

        case 'delay':
            if (!node.data || !node.data.mode) {
                errors.push(`Delay node ${node.id} is missing mode`);
            } else if (node.data.mode === 'absolute') {
                if (!node.data.absoluteTime) {
                    errors.push(`Delay node ${node.id} is missing absolute time`);
                } else {
                    const delayTime = new Date(node.data.absoluteTime);
                    if (delayTime <= new Date()) {
                        errors.push(`Delay node ${node.id} absolute time must be in the future`);
                    }
                }
            } else if (node.data.mode === 'relative') {
                if (!node.data.relativeValue || node.data.relativeValue <= 0) {
                    errors.push(`Delay node ${node.id} relative value must be greater than 0`);
                }
                if (!node.data.relativeUnit) {
                    errors.push(`Delay node ${node.id} is missing relative unit`);
                }
            }
            break;

        case 'condition':
            if (!node.data || !node.data.rules || node.data.rules.length === 0) {
                errors.push(`Condition node ${node.id} must have at least one rule`);
            } else {
                node.data.rules.forEach((rule, idx) => {
                    if (!rule.operator || !rule.value) {
                        errors.push(`Condition node ${node.id} rule ${idx + 1} is incomplete`);
                    }
                });
            }
            break;

        case 'start':
        case 'end':
            // No additional validation needed
            break;

        default:
            errors.push(`Unknown node type: ${node.type}`);
    }
}

function validateEdges(nodes, edges, errors) {
    const nodeIds = new Set(nodes.map(n => n.id));

    edges.forEach(edge => {
        if (!nodeIds.has(edge.source)) {
            errors.push(`Edge ${edge.id} has invalid source node ${edge.source}`);
        }
        if (!nodeIds.has(edge.target)) {
            errors.push(`Edge ${edge.id} has invalid target node ${edge.target}`);
        }
    });

    // Check Start node has exactly 1 outgoing edge
    const startNode = nodes.find(n => n.type === 'start');
    if (startNode) {
        const outgoing = edges.filter(e => e.source === startNode.id);
        if (outgoing.length !== 1) {
            errors.push('Start node must have exactly one outgoing edge');
        }
    }

    // Check End node has no outgoing edges
    const endNode = nodes.find(n => n.type === 'end');
    if (endNode) {
        const outgoing = edges.filter(e => e.source === endNode.id);
        if (outgoing.length > 0) {
            errors.push('End node cannot have outgoing edges');
        }
    }

    // Check condition nodes have exactly 2 outgoing edges (true/false)
    nodes.filter(n => n.type === 'condition').forEach(node => {
        const outgoing = edges.filter(e => e.source === node.id);
        if (outgoing.length !== 2) {
            errors.push(`Condition node ${node.id} must have exactly 2 outgoing edges (true/false)`);
        } else {
            const handles = outgoing.map(e => e.sourceHandle).sort();
            if (handles[0] !== 'false' || handles[1] !== 'true') {
                errors.push(`Condition node ${node.id} must have 'true' and 'false' handles`);
            }
        }
    });
}

function validateConnectivity(nodes, edges, startNode, endNode, errors) {
    // Build adjacency list
    const graph = new Map();
    nodes.forEach(node => graph.set(node.id, []));
    edges.forEach(edge => {
        if (graph.has(edge.source)) {
            graph.get(edge.source).push(edge.target);
        }
    });

    // BFS from start to find reachable nodes
    const reachable = new Set();
    const queue = [startNode.id];
    reachable.add(startNode.id);

    while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = graph.get(current) || [];

        neighbors.forEach(neighbor => {
            if (!reachable.has(neighbor)) {
                reachable.add(neighbor);
                queue.push(neighbor);
            }
        });
    }

    // Check if all nodes are reachable
    const unreachable = nodes.filter(n => !reachable.has(n.id));
    if (unreachable.length > 0) {
        errors.push(`Unreachable nodes: ${unreachable.map(n => n.id).join(', ')}`);
    }

    // Check if End node is reachable
    if (endNode && !reachable.has(endNode.id)) {
        errors.push('End node is not reachable from Start node');
    }
}
