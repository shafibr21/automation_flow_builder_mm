'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Automation } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [testDialog, setTestDialog] = useState<{ show: boolean; automation?: Automation }>({
    show: false,
  });
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      const data = await apiClient.getAutomations();
      setAutomations(data);
    } catch (error) {
      console.error('Failed to load automations:', error);
      alert('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const automation = await apiClient.createAutomation({
        name: newName.trim(),
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 250, y: 50 },
            data: {},
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 250, y: 400 },
            data: {},
          },
        ],
        edges: [
          {
            id: 'e-start-end',
            source: 'start-1',
            target: 'end-1',
          },
        ],
      });
      setShowCreateDialog(false);
      setNewName('');
      router.push(`/automations/${automation._id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create automation');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await apiClient.deleteAutomation(id);
      setAutomations(automations.filter((a) => a._id !== id));
    } catch (error) {
      alert('Failed to delete automation');
    }
  };

  const handleTest = async () => {
    if (!testDialog.automation || !testEmail.trim()) return;

    try {
      const result = await apiClient.startTest(testDialog.automation._id, testEmail.trim());
      alert(`Test started successfully!\n\nExecution ID: ${result.executionId}\n\nCheck your email (${testEmail}) for messages. If using Ethereal, check the server console for preview URLs.`);
      setTestDialog({ show: false });
      setTestEmail('');
    } catch (error: any) {
      alert(error.message || 'Failed to start test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Automation Flow Builder</h1>
            <p className="text-gray-600 mt-2">Create and manage email automation flows</p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-bold"
          >
            + New Automation
          </button>
        </div>

        {automations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No automations yet</h2>
            <p className="text-gray-500 mb-6">Create your first automation to get started</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Create Automation
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-bold">Name</th>
                  <th className="text-left p-4 font-bold">Created</th>
                  <th className="text-left p-4 font-bold">Updated</th>
                  <th className="text-right p-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {automations.map((automation) => (
                  <tr key={automation._id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{automation.name}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(automation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(automation.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => router.push(`/automations/${automation._id}`)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setTestDialog({ show: true, automation })}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleDelete(automation._id, automation.name)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Automation</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Automation Name *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="e.g., Welcome Email Flow"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewName('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Dialog */}
      {testDialog.show && testDialog.automation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Test Automation</h2>
            <p className="text-gray-600 mb-4">
              Testing: <strong>{testDialog.automation.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Test Email Address *</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="test@example.com"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTestDialog({ show: false });
                  setTestEmail('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTest}
                disabled={!testEmail.trim()}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
