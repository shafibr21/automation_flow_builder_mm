export interface NodeData {
    // Action node
    message?: string;

    // Delay node
    mode?: 'absolute' | 'relative';
    absoluteTime?: string;
    relativeValue?: number;
    relativeUnit?: 'minutes' | 'hours' | 'days';

    // Condition node
    rules?: ConditionRule[];
    logic?: 'AND' | 'OR';
}

export interface ConditionRule {
    field: string;
    operator: 'equals' | 'not_equals' | 'includes' | 'starts_with' | 'ends_with';
    value: string;
}

export interface FlowNode {
    id: string;
    type: 'start' | 'end' | 'action' | 'delay' | 'condition';
    position: { x: number; y: number };
    data: NodeData;
}

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

export interface Automation {
    _id: string;
    name: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    createdAt: string;
    updatedAt: string;
}
