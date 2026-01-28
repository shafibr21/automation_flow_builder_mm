'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Automation } from '@/lib/types';
import Button from '@/components/ui/Button';
import Image from 'next/image';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="text-xl font-sans">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8F9FB]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* App Name */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Automation Flow Builder"
              width={25}
              height={25}
              className="inline-block mr-2"
            />
            <h1 className="text-lg font-semibold text-gray-900 font-sans">Automation Flow</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 font-sans">
            <span className="mr-3">📊</span>
            Dashboard
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md font-sans">
            <span className="mr-3">⚙️</span>
            Automations
          </a>
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-gray-200">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 font-sans">
            <span className="mr-3">⚙️</span>
            Settings
          </a>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 font-sans">Automations</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 font-sans">
              <div className="sm:hidden">
                <Button onClick={() => setShowCreateDialog(true)} size="sm" >
                + New
              </Button>
              </div>
              <div className="hidden sm:inline-flex">
                <Button onClick={() => setShowCreateDialog(true)} >
                Create Automation
              </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 font-sans">Email Workflows</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-sans">Manage your automated email sequences and triggers</p>
          </div>

          {automations.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-2 font-sans">No automations yet</h2>
              <p className="text-sm text-gray-500 mb-6 font-sans">Create your first automation to get started</p>
              <Button onClick={() => setShowCreateDialog(true)} className='font-sans'>Create Automation</Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="text-left px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                      <th className="text-left px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Updated</th>
                      <th className="text-right px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {automations.map((automation) => (
                    <tr key={automation._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center">
                          <div className="shrink-0 h-8 w-8 bg-indigo-100 rounded flex items-center justify-center mr-2 sm:mr-3">
                            <span className="text-indigo-600 text-sm font-medium">📧</span>
                          </div>
                          <div className="font-medium text-sm sm:text-base text-gray-900 font-sans">{automation.name}</div>
                        </div>
                      </td>  
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 font-sans hidden md:table-cell">
                        {new Date(automation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 font-sans hidden md:table-cell">
                        {new Date(automation.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-right font-sans">
                        <div className="inline-flex items-center justify-end space-x-1 sm:space-x-2">
                          <div className="hidden sm:inline-flex">
                            <Button onClick={() => router.push(`/automations/${automation._id}`)} size="sm" variant="success" >Edit</Button>
                          </div>
                          <div className="sm:hidden px-2">
                            <Button onClick={() => router.push(`/automations/${automation._id}`)} size="sm" variant="success" >✏️</Button>
                          </div>
                          <div className="hidden sm:inline-flex">
                          <Button onClick={() => setTestDialog({ show: true, automation })} size="sm" variant="primary">Test</Button>
                          </div>
                          <div className="sm:hidden px-2">
                            <Button onClick={() => setTestDialog({ show: true, automation })} size="sm" variant="primary" >▶️</Button>
                          </div>
                          <div className="hidden sm:inline-flex">
                            <Button onClick={() => handleDelete(automation._id, automation.name)} size="sm" variant="danger" >Delete</Button>
                          </div>
                          <div className="sm:hidden px-2">
                            <Button onClick={() => handleDelete(automation._id, automation.name)} size="sm" variant="danger" >🗑️</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-40 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full border border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Create New Automation</h2>
            <div className="mb-4 sm:mb-5">
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Automation Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-black font-sans text-sm sm:text-base"
                placeholder="e.g., Welcome Email Flow"
                autoFocus
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewName('');
                }}
                variant="secondary"
                className="flex-1 w-full"
                size="sm"
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!newName.trim() || creating} className="flex-1 w-full" size="sm">
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Test Dialog */}
      {testDialog.show && testDialog.automation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-40 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full border border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 font-sans">Test Automation</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Testing: <strong className="text-gray-900">{testDialog.automation.name}</strong>
            </p>
            <div className="mb-4 sm:mb-5">
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 font-sans">Test Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full font-sans text-sm sm:text-base"
                placeholder="test@example.com"
                autoFocus
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => {
                  setTestDialog({ show: false });
                  setTestEmail('');
                }}
                variant="secondary"
                className="flex-1 w-full"
                size="sm"
              >
                Cancel
              </Button>
              <Button onClick={handleTest} disabled={!testEmail.trim()} className="flex-1 w-full" size="sm">
                Start Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
