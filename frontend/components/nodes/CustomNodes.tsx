'use client';

import { Handle, Position } from '@xyflow/react';

export function StartNode() {
    return (
        <div className="px-6 py-4 bg-green-500 text-white rounded-lg shadow-lg border-2 border-green-600">
            <div className="font-bold text-center">Start</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}

export function EndNode() {
    return (
        <div className="px-6 py-4 bg-red-500 text-white rounded-lg shadow-lg border-2 border-red-600">
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            <div className="font-bold text-center">End</div>
        </div>
    );
}

export function ActionNode({ data, selected }: { data: any; selected: boolean }) {
    return (
        <div className={`px-4 py-3 bg-blue-500 text-white rounded-lg shadow-lg border-2 ${selected ? 'border-blue-300 ring-2 ring-blue-300' : 'border-blue-600'
            } min-w-[200px]`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            <div className="font-bold text-sm mb-1">📧 Send Email</div>
            {data.message ? (
                <div className="text-xs opacity-90 truncate max-w-[180px]">
                    {data.message.substring(0, 40)}...
                </div>
            ) : (
                <div className="text-xs opacity-70 italic">Click to configure</div>
            )}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}

export function DelayNode({ data, selected }: { data: any; selected: boolean }) {
    const getDelayText = () => {
        if (!data.mode) return 'Not configured';
        if (data.mode === 'absolute') {
            return data.absoluteTime
                ? new Date(data.absoluteTime).toLocaleString()
                : 'Set time';
        } else {
            return data.relativeValue && data.relativeUnit
                ? `${data.relativeValue} ${data.relativeUnit}`
                : 'Set duration';
        }
    };

    return (
        <div className={`px-4 py-3 bg-purple-500 text-white rounded-lg shadow-lg border-2 ${selected ? 'border-purple-300 ring-2 ring-purple-300' : 'border-purple-600'
            } min-w-[200px]`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            <div className="font-bold text-sm mb-1">⏰ Delay</div>
            <div className="text-xs opacity-90 truncate max-w-[180px]">
                {getDelayText()}
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}

export function ConditionNode({ data, selected }: { data: any; selected: boolean }) {
    const ruleCount = data.rules?.length || 0;

    return (
        <div className={`px-4 py-3 bg-yellow-500 text-white rounded-lg shadow-lg border-2 ${selected ? 'border-yellow-300 ring-2 ring-yellow-300' : 'border-yellow-600'
            } min-w-[200px]`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            <div className="font-bold text-sm mb-1">🔀 Condition</div>
            <div className="text-xs opacity-90">
                {ruleCount > 0 ? `${ruleCount} rule(s)` : 'Click to configure'}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className="w-3 h-3 -left-2"
                style={{ left: '25%' }}
            />
            <div className="absolute bottom-0 left-[25%] transform -translate-x-1/2 translate-y-6 text-xs font-bold">
                TRUE
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className="w-3 h-3"
                style={{ left: '75%' }}
            />
            <div className="absolute bottom-0 left-[75%] transform -translate-x-1/2 translate-y-6 text-xs font-bold">
                FALSE
            </div>
        </div>
    );
}
