import express from 'express';
import Automation from '../models/Automation.js';
import { validateAutomation } from '../services/validationService.js';

const router = express.Router();

/**
 * GET /api/automations
 * List all automations
 */
router.get('/', async (req, res) => {
    try {
        const automations = await Automation.find()
            .select('name createdAt updatedAt')
            .sort({ updatedAt: -1 });

        res.json(automations);
    } catch (error) {
        console.error('Error fetching automations:', error);
        res.status(500).json({ error: 'Failed to fetch automations' });
    }
});

/**
 * GET /api/automations/:id
 * Get single automation
 */
router.get('/:id', async (req, res) => {
    try {
        const automation = await Automation.findById(req.params.id);

        if (!automation) {
            return res.status(404).json({ error: 'Automation not found' });
        }

        res.json(automation);
    } catch (error) {
        console.error('Error fetching automation:', error);
        res.status(500).json({ error: 'Failed to fetch automation' });
    }
});

/**
 * POST /api/automations
 * Create new automation
 */
router.post('/', async (req, res) => {
    try {
        const { name, nodes, edges } = req.body;

        // Validate request
        if (!name || !nodes || !edges) {
            return res.status(400).json({
                error: 'Missing required fields: name, nodes, edges'
            });
        }

        // Validate automation structure
        const validationErrors = validateAutomation({ nodes, edges });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // Create automation
        const automation = new Automation({ name, nodes, edges });
        await automation.save();

        res.status(201).json(automation);
    } catch (error) {
        console.error('Error creating automation:', error);

        // Handle duplicate name error
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Automation name must be unique'
            });
        }

        res.status(500).json({ error: 'Failed to create automation' });
    }
});

/**
 * PUT /api/automations/:id
 * Update automation
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, nodes, edges } = req.body;

        const automation = await Automation.findById(req.params.id);
        if (!automation) {
            return res.status(404).json({ error: 'Automation not found' });
        }

        // Validate if nodes/edges are being updated
        if (nodes && edges) {
            const validationErrors = validateAutomation({ nodes, edges });
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validationErrors
                });
            }
        }

        // Update fields
        if (name) automation.name = name;
        if (nodes) automation.nodes = nodes;
        if (edges) automation.edges = edges;

        await automation.save();

        res.json(automation);
    } catch (error) {
        console.error('Error updating automation:', error);

        // Handle duplicate name error
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Automation name must be unique'
            });
        }

        res.status(500).json({ error: 'Failed to update automation' });
    }
});

/**
 * DELETE /api/automations/:id
 * Delete automation
 */
router.delete('/:id', async (req, res) => {
    try {
        const automation = await Automation.findByIdAndDelete(req.params.id);

        if (!automation) {
            return res.status(404).json({ error: 'Automation not found' });
        }

        res.json({ message: 'Automation deleted successfully' });
    } catch (error) {
        console.error('Error deleting automation:', error);
        res.status(500).json({ error: 'Failed to delete automation' });
    }
});

export default router;
