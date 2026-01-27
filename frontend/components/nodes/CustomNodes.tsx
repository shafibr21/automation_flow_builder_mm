'use client';

import { Handle, Position } from '@xyflow/react';

export function StartNode() {
    return (
        <div className="px-5 py-3 bg-gray-100 text-gray-700 rounded-full border border-gray-300">
            <div className="font-medium text-sm text-center">Start</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}

export function EndNode() {
    return (
        <div className="px-5 py-3 bg-gray-100 text-gray-700 rounded-full border border-gray-300">
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            <div className="font-medium text-sm text-center">End</div>
        </div>
    );
}

export function ActionNode({ data, selected }: { data: any; selected: boolean }) {
    return (
        <div className={`px-4 py-3 bg-white rounded-lg border-2 ${selected ? 'border-indigo-500 shadow-sm' : 'border-gray-200'
            } min-w-[200px]`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            <div className="font-medium text-sm mb-1 text-gray-900">Send Email</div>
            {data.message ? (
                <div className="text-xs text-gray-500 truncate max-w-[180px]">
                    {data.message.substring(0, 40)}...
                </div>
            ) : (
                <div className="text-xs text-gray-400 italic">Click to configure</div>
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
        <div className={`px-4 py-3 bg-white rounded-lg border-2 ${selected ? 'border-indigo-500 shadow-sm' : 'border-gray-200'
            } min-w-[200px]`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            <div className="font-medium text-sm mb-1 text-gray-900">Delay</div>
            <div className="text-xs text-gray-500 truncate max-w-[180px]">
                {getDelayText()}
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}

export function ConditionNode({ data, selected }: { data: any; selected: boolean }) {
    const ruleCount = data.rules?.length || 0;

    return (
        <div className={`px-4 py-3 bg-white rounded-lg border-2 ${selected ? 'border-indigo-500 shadow-sm' : 'border-gray-200'
            } min-w-[200px]`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            <div className="font-medium text-sm mb-1 text-gray-900">Condition</div>
            <div className="text-xs text-gray-500">
                {ruleCount > 0 ? `${ruleCount} rule(s)` : 'Click to configure'}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className="w-3 h-3 -left-2"
                style={{ left: '25%' }}
            />
            <div className="absolute bottom-0 left-[25%] transform -translate-x-1/2 translate-y-6 text-xs font-medium text-gray-600">
                TRUE
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className="w-3 h-3"
                style={{ left: '75%' }}
            />
            <div className="absolute bottom-0 left-[75%] transform -translate-x-1/2 translate-y-6 text-xs font-medium text-gray-600">
                FALSE
            </div>
        </div>
    );
}
