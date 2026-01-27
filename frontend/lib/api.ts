const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
    // Automations
    async getAutomations() {
        const response = await fetch(`${API_BASE_URL}/automations`);
        if (!response.ok) throw new Error('Failed to fetch automations');
        return response.json();
    }

    async getAutomation(id: string) {
        const response = await fetch(`${API_BASE_URL}/automations/${id}`);
        if (!response.ok) throw new Error('Failed to fetch automation');
        return response.json();
    }

    async createAutomation(data: { name: string; nodes: any[]; edges: any[] }) {
        const response = await fetch(`${API_BASE_URL}/automations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create automation');
        }
        return response.json();
    }

    async updateAutomation(id: string, data: { name?: string; nodes?: any[]; edges?: any[] }) {
        const response = await fetch(`${API_BASE_URL}/automations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update automation');
        }
        return response.json();
    }

    async deleteAutomation(id: string) {
        const response = await fetch(`${API_BASE_URL}/automations/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete automation');
        return response.json();
    }

    // Test execution
    async startTest(automationId: string, email: string) {
        const response = await fetch(`${API_BASE_URL}/executions/${automationId}/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to start test');
        }
        return response.json();
    }

    async getExecution(id: string) {
        const response = await fetch(`${API_BASE_URL}/executions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch execution');
        return response.json();
    }
}

export const apiClient = new ApiClient();
