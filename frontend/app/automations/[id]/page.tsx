'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FlowEditor from '@/components/FlowEditor';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { Automation } from '@/lib/types';
import { Node, Edge } from '@xyflow/react';

export default function AutomationEditorPage() {
    const router = useRouter();
    const params = useParams();
    const automationId = params.id as string;

    const [automation, setAutomation] = useState<Automation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAutomation();
    }, [automationId]);

    const loadAutomation = async () => {
        try {
            const data = await apiClient.getAutomation(automationId);
            setAutomation(data);
        } catch (error) {
            console.error('Failed to load automation:', error);
            alert('Failed to load automation');
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (nodes: Node[], edges: Edge[]) => {
        try {
            await apiClient.updateAutomation(automationId, {
                nodes: nodes.map(n => ({
                    id: n.id,
                    type: n.type as any,
                    position: n.position,
                    data: n.data
                })),
                edges: edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle,
                    targetHandle: e.targetHandle
                }))
            });
            alert('Flow saved successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to save flow');
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!automation) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col bg-[#F8F9FB]">
            <div className="border-b border-gray-200 bg-white">
                <div className="max-w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" size="sm" onClick={() => router.push('/')}>
                                ← Back
                            </Button>
                            <h1 className="text-lg font-semibold text-gray-900">{automation.name}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <FlowEditor
                    automationId={automationId}
                    initialData={{
                        nodes: automation.nodes as Node[],
                        edges: automation.edges as Edge[]
                    }}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
}
