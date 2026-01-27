'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Automation } from '@/lib/types';
import Button from '@/components/ui/Button';

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
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Automations</h1>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            Create Automation
          </Button>
        </div>

        {automations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">No automations yet</h2>
            <p className="text-sm text-gray-500 mb-6">Create your first automation to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>Create Automation</Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {automations.map((automation) => (
                  <tr key={automation._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{automation.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(automation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(automation.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button onClick={() => router.push(`/automations/${automation._id}`)} size="sm" variant="secondary">Edit</Button>
                      <Button onClick={() => setTestDialog({ show: true, automation })} size="sm" variant="secondary">Test</Button>
                      <Button onClick={() => handleDelete(automation._id, automation.name)} size="sm" variant="secondary">Delete</Button>
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border border-gray-200 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Create New Automation</h2>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2 text-gray-700">Automation Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full"
                placeholder="e.g., Welcome Email Flow"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewName('');
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!newName.trim() || creating} className="flex-1">
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Test Dialog */}
      {testDialog.show && testDialog.automation && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border border-gray-200 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Test Automation</h2>
            <p className="text-sm text-gray-600 mb-4">
              Testing: <strong className="text-gray-900">{testDialog.automation.name}</strong>
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2 text-gray-700">Test Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full"
                placeholder="test@example.com"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setTestDialog({ show: false });
                  setTestEmail('');
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleTest} disabled={!testEmail.trim()} className="flex-1">
                Start Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
