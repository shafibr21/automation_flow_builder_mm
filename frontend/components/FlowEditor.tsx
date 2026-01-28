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
    const [sidePanelOpen, setSidePanelOpen] = useState(false);

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
            setSidePanelOpen(false);
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
            setSidePanelOpen(false);
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
        <div className="flex h-full">
            {/* Main canvas */}
            <div className="flex-1 relative bg-gray-50 ">
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
                        <Background gap={16} className='bg-gray-600' />
                        <Controls className='text-black'/>
                        <MiniMap
                            className="absolute right-4 bottom-4 bg-white border border-gray-200 rounded-md h-30 w-40 "
                            nodeColor="#d1d5db"
                        />
                </ReactFlow>

                {/* Floating toolbar */}
                <div className="absolute top-1 left-1 sm:top-4 sm:left-4 bg-white rounded-lg border border-gray-200 p-2 sm:p-3 space-y-2 shadow-sm" style={{ minWidth: 140, maxWidth: 160 }}>
                    <h3 className="font-medium text-xs text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Add Node</h3>
                    <Button onClick={() => addNode('action')} className="w-full text-xs" size="sm" variant="success">Email</Button>
                    <Button onClick={() => addNode('delay')} className="w-full text-xs" size="sm" variant="danger">Delay</Button>
                    <Button onClick={() => addNode('condition')} className="w-full text-xs" size="sm" variant="primary">Condition</Button>
                </div>

                {/* Save button */}
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                    <Button onClick={handleSave} disabled={isSaving} size="sm" className="sm:text-base">
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>

                {/* Mobile panel toggle */}
                {selectedNode && (
                    <button
                        onClick={() => setSidePanelOpen(true)}
                        className="md:hidden absolute top-2 right-2 bg-white rounded-lg border border-gray-200 p-2 shadow-sm z-10"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Right sidebar */}
            {sidePanelOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-50 z-40 md:hidden" 
                    onClick={() => setSidePanelOpen(false)}
                />
            )}
            <div 
                className={`
                    fixed md:static inset-y-0 right-0 z-50
                    w-80 max-w-full bg-white border-l border-gray-200 overflow-y-auto
                    transform transition-transform duration-300 ease-in-out
                    ${sidePanelOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                    ${!selectedNode ? 'hidden md:block' : ''}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {selectedNode ? (
                    <div>
                        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Configure Node</h3>
                            <button onClick={() => setSidePanelOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
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
                        <div className="p-4 border-t border-gray-200">
                            <Button onClick={deleteSelectedNode} variant="danger" className="w-full">Delete Node</Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-gray-500 text-sm">
                        <p className="text-gray-900 font-medium mb-3 font-sans">No node selected</p>
                        <p className="mb-4 font-sans">Select a node to configure it</p>
                        <div className="space-y-2 text-xs">
                            <p className="font-medium text-gray-700">Tips:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 font-sans">
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
