'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Node,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StartNode, EndNode, ActionNode, DelayNode, ConditionNode } from './nodes/CustomNodes';
import { ActionPanel, DelayPanel, ConditionPanel } from './panels/ConfigPanels';
import Button from './ui/Button';

const nodeTypes = {
    start: StartNode,
    end: EndNode,
    action: ActionNode,
    delay: DelayNode,
    condition: ConditionNode,
};

const initialNodes: Node[] = [
    {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: {},
        draggable: true,
        deletable: false,
    },
    {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 400 },
        data: {},
        draggable: true,
        deletable: false,
    },
];

const initialEdges: Edge[] = [
    {
        id: 'e-start-end',
        source: 'start-1',
        target: 'end-1',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
];

interface FlowEditorProps {
    automationId?: string;
    initialData?: { nodes: Node[]; edges: Edge[] };
    onSave: (nodes: Node[], edges: Edge[]) => Promise<void>;
}

export default function FlowEditor({ automationId, initialData, onSave }: FlowEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(
        initialData?.nodes || initialNodes
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState(
        initialData?.edges || initialEdges
    );
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => {
            // Validate connection
            const sourceNode = nodes.find((n) => n.id === params.source);
            const targetNode = nodes.find((n) => n.id === params.target);

            if (!sourceNode || !targetNode) return;

            // End node cannot have outgoing edges
            if (sourceNode.type === 'end') {
                alert('End node cannot have outgoing connections');
                return;
            }

            // Start node cannot have incoming edges
            if (targetNode.type === 'start') {
                alert('Start node cannot have incoming connections');
                return;
            }

            // Check if source already has an outgoing edge (except for condition nodes)
            if (sourceNode.type !== 'condition') {
                const existingEdge = edges.find((e) => e.source === params.source);
                if (existingEdge) {
                    // Remove existing edge
                    setEdges((eds) => eds.filter((e) => e.id !== existingEdge.id));
                }
            }

            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    },
                    eds
                )
            );
        },
        [nodes, edges, setEdges]
    );

    const addNode = (type: 'action' | 'delay' | 'condition') => {
        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position: { x: 250, y: 200 },
            data: {},
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const updateNodeData = useCallback(
        (nodeId: string, newData: any) => {
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
                )
            );
            setSelectedNode(null);
        },
        [setNodes]
    );

    const deleteSelectedNode = () => {
        if (selectedNode && selectedNode.type !== 'start' && selectedNode.type !== 'end') {
            setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
            setEdges((eds) =>
                eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
            );
            setSelectedNode(null);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(nodes, edges);
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const onNodeClick = useCallback((_: any, node: Node) => {
        if (node.type !== 'start' && node.type !== 'end') {
            setSelectedNode(node);
        }
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    return (
        <div className="flex h-screen">
            {/* Main canvas */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                >
                        <Background />
                        <Controls />
                        <MiniMap style={{ right: 16, bottom: 120, background: 'transparent', width: 140, height: 88 }} />
                </ReactFlow>

                {/* Floating toolbar */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 space-y-3" style={{ minWidth: 160 }}>
                    <h3 className="font-bold text-sm mb-1">Add Node</h3>
                    <Button onClick={() => addNode('action')} className="w-full" size="sm">📧 Email Action</Button>
                    <Button onClick={() => addNode('delay')} className="w-full" size="sm" variant="ghost">⏰ Delay</Button>
                    <Button onClick={() => addNode('condition')} className="w-full" size="sm" variant="ghost">🔀 Condition</Button>
                </div>

                {/* Save button */}
                <div className="absolute bottom-6 right-24 z-50">
                    <Button onClick={handleSave} disabled={isSaving} variant="success" size="lg">
                        {isSaving ? 'Saving...' : 'Save Flow'}
                    </Button>
                </div>
            </div>

            {/* Right sidebar */}
            <div className="w-80 bg-gray-50 border-l overflow-y-auto">
                {selectedNode ? (
                    <div>
                        {selectedNode.type === 'action' && (
                            <ActionPanel
                                data={selectedNode.data}
                                onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                            />
                        )}
                        {selectedNode.type === 'delay' && (
                            <DelayPanel
                                data={selectedNode.data}
                                onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                            />
                        )}
                        {selectedNode.type === 'condition' && (
                            <ConditionPanel
                                data={selectedNode.data}
                                onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                            />
                        )}
                        <div className="p-4 border-t">
                            <Button onClick={deleteSelectedNode} variant="danger" className="w-full">Delete Node</Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-gray-500 text-sm">
                        <p>Select a node to configure it</p>
                        <div className="mt-4 space-y-2 text-xs">
                            <p className="font-bold">Tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Drag nodes to reposition</li>
                                <li>Click nodes to configure</li>
                                <li>Connect nodes by dragging from handles</li>
                                <li>Delete edges by selecting and pressing Delete</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
