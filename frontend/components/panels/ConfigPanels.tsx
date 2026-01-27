'use client';

import { useState } from 'react';

interface ActionPanelProps {
    data: any;
    onUpdate: (data: any) => void;
}

export function ActionPanel({ data, onUpdate }: ActionPanelProps) {
    const [message, setMessage] = useState(data.message || '');

    const handleSave = () => {
        onUpdate({ message });
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="font-bold text-lg">📧 Email Action</h3>
            <div>
                <label className="block text-sm font-medium mb-2">
                    Email Message *
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border rounded p-2 min-h-[100px] text-sm"
                    placeholder="Enter the email message to send..."
                />
            </div>
            <button
                onClick={handleSave}
                disabled={!message.trim()}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Save
            </button>
        </div>
    );
}

interface DelayPanelProps {
    data: any;
    onUpdate: (data: any) => void;
}

export function DelayPanel({ data, onUpdate }: DelayPanelProps) {
    const [mode, setMode] = useState<'absolute' | 'relative'>(data.mode || 'relative');
    const [absoluteTime, setAbsoluteTime] = useState(
        data.absoluteTime ? new Date(data.absoluteTime).toISOString().slice(0, 16) : ''
    );
    const [relativeValue, setRelativeValue] = useState(data.relativeValue || 1);
    const [relativeUnit, setRelativeUnit] = useState<'minutes' | 'hours' | 'days'>(
        data.relativeUnit || 'minutes'
    );

    const handleSave = () => {
        if (mode === 'absolute') {
            onUpdate({
                mode: 'absolute',
                absoluteTime: new Date(absoluteTime).toISOString(),
                relativeValue: undefined,
                relativeUnit: undefined
            });
        } else {
            onUpdate({
                mode: 'relative',
                relativeValue,
                relativeUnit,
                absoluteTime: undefined
            });
        }
    };

    const isValid = () => {
        if (mode === 'absolute') {
            return absoluteTime && new Date(absoluteTime) > new Date();
        } else {
            return relativeValue > 0;
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="font-bold text-lg">⏰ Delay</h3>

            <div>
                <label className="block text-sm font-medium mb-2">Delay Mode</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('relative')}
                        className={`flex-1 py-2 px-3 rounded text-sm ${mode === 'relative'
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Relative
                    </button>
                    <button
                        onClick={() => setMode('absolute')}
                        className={`flex-1 py-2 px-3 rounded text-sm ${mode === 'absolute'
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Absolute
                    </button>
                </div>
            </div>

            {mode === 'absolute' ? (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        value={absoluteTime}
                        onChange={(e) => setAbsoluteTime(e.target.value)}
                        className="w-full border rounded p-2 text-sm"
                        min={new Date().toISOString().slice(0, 16)}
                    />
                    {absoluteTime && new Date(absoluteTime) <= new Date() && (
                        <p className="text-red-500 text-xs mt-1">Time must be in the future</p>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Duration *</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={relativeValue}
                            onChange={(e) => setRelativeValue(parseInt(e.target.value) || 0)}
                            min="1"
                            className="flex-1 border rounded p-2 text-sm"
                        />
                        <select
                            value={relativeUnit}
                            onChange={(e) => setRelativeUnit(e.target.value as any)}
                            className="border rounded p-2 text-sm"
                        >
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                        </select>
                    </div>
                </div>
            )}

            <button
                onClick={handleSave}
                disabled={!isValid()}
                className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Save
            </button>
        </div>
    );
}

interface ConditionPanelProps {
    data: any;
    onUpdate: (data: any) => void;
}

export function ConditionPanel({ data, onUpdate }: ConditionPanelProps) {
    const [rules, setRules] = useState(data.rules || [{ field: 'email', operator: 'includes', value: '' }]);
    const [logic, setLogic] = useState<'AND' | 'OR'>(data.logic || 'AND');

    const addRule = () => {
        setRules([...rules, { field: 'email', operator: 'includes', value: '' }]);
    };

    const removeRule = (index: number) => {
        if (rules.length > 1) {
            setRules(rules.filter((_: any, i: number) => i !== index));
        }
    };

    const updateRule = (index: number, field: string, value: any) => {
        const newRules = [...rules];
        newRules[index] = { ...newRules[index], [field]: value };
        setRules(newRules);
    };

    const handleSave = () => {
        onUpdate({ rules, logic });
    };

    const isValid = () => {
        return rules.every((rule: any) => rule.value.trim() !== '');
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="font-bold text-lg">🔀 Condition</h3>

            <div>
                <label className="block text-sm font-medium mb-2">Logic</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setLogic('AND')}
                        className={`flex-1 py-2 px-3 rounded text-sm ${logic === 'AND'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        AND
                    </button>
                    <button
                        onClick={() => setLogic('OR')}
                        className={`flex-1 py-2 px-3 rounded text-sm ${logic === 'OR'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        OR
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Rules</label>
                {rules.map((rule: any, index: number) => (
                    <div key={index} className="border rounded p-3 space-y-2 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600">Rule {index + 1}</span>
                            {rules.length > 1 && (
                                <button
                                    onClick={() => removeRule(index)}
                                    className="text-red-500 text-xs hover:text-red-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <div className="text-sm text-gray-600">Email</div>
                        <select
                            value={rule.operator}
                            onChange={(e) => updateRule(index, 'operator', e.target.value)}
                            className="w-full border rounded p-2 text-sm"
                        >
                            <option value="equals">equals</option>
                            <option value="not_equals">not equals</option>
                            <option value="includes">includes</option>
                            <option value="starts_with">starts with</option>
                            <option value="ends_with">ends with</option>
                        </select>
                        <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => updateRule(index, 'value', e.target.value)}
                            placeholder="Value"
                            className="w-full border rounded p-2 text-sm"
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={addRule}
                className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-2 rounded hover:border-gray-400 hover:text-gray-700"
            >
                + Add Rule
            </button>

            <button
                onClick={handleSave}
                disabled={!isValid()}
                className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Save
            </button>
        </div>
    );
}
