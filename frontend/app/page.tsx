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
    <div className="h-screen flex overflow-hidden bg-[#F8F9FB]">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* App Name */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Automation Flow</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
            <span className="mr-3">📊</span>
            Dashboard
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md">
            <span className="mr-3">⚙️</span>
            Automations
          </a>
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-gray-200">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
            <span className="mr-3">⚙️</span>
            Settings
          </a>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Automations</h2>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Automation
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Workflows</h3>
            <p className="text-sm text-gray-500">Manage your automated email sequences and triggers</p>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="shrink-0 h-8 w-8 bg-indigo-100 rounded flex items-center justify-center mr-3">
                            <span className="text-indigo-600 text-sm font-medium">📧</span>
                          </div>
                          <div className="font-medium text-gray-900">{automation.name}</div>
                        </div>
                      </td>  
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(automation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(automation.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center justify-end space-x-2">
                          <Button onClick={() => router.push(`/automations/${automation._id}`)} size="sm" variant="success">Edit</Button>
                          <Button onClick={() => setTestDialog({ show: true, automation })} size="sm" variant="primary">Test</Button>
                          <Button onClick={() => handleDelete(automation._id, automation.name)} size="sm" variant="danger">Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border border-gray-200 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Create New Automation</h2>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2 text-gray-700">Automation Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-black font-sans"
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
