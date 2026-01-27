import express from 'express';
import Automation from '../models/Automation.js';
import TestExecution from '../models/TestExecution.js';
import { startTestExecution } from '../services/executionEngine.js';
import { validateAutomation } from '../services/validationService.js';

const router = express.Router();

/**
 * POST /api/automations/:id/test
 * Start test execution
 */
router.post('/:id/test', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email format (basic)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Get automation
        const automation = await Automation.findById(req.params.id);
        if (!automation) {
            return res.status(404).json({ error: 'Automation not found' });
        }

        // Validate automation before execution
        const validationErrors = validateAutomation(automation);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Cannot execute invalid automation',
                details: validationErrors
            });
        }

        // Start execution
        const execution = await startTestExecution(req.params.id, email.trim());

        res.status(201).json({
            executionId: execution._id,
            message: 'Test execution started successfully',
            status: execution.status
        });
    } catch (error) {
        console.error('Error starting test execution:', error);
        res.status(500).json({ error: 'Failed to start test execution' });
    }
});

/**
 * GET /api/executions/:id
 * Get execution status and logs
 */
router.get('/:id', async (req, res) => {
    try {
        const execution = await TestExecution.findById(req.params.id)
            .populate('automationId', 'name');

        if (!execution) {
            return res.status(404).json({ error: 'Execution not found' });
        }

        res.json(execution);
    } catch (error) {
        console.error('Error fetching execution:', error);
        res.status(500).json({ error: 'Failed to fetch execution' });
    }
});

/**
 * GET /api/executions
 * List all executions (optional - for debugging)
 */
router.get('/', async (req, res) => {
    try {
        const executions = await TestExecution.find()
            .populate('automationId', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(executions);
    } catch (error) {
        console.error('Error fetching executions:', error);
        res.status(500).json({ error: 'Failed to fetch executions' });
    }
});

export default router;
