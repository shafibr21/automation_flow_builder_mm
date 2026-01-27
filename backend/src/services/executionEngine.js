import TestExecution from '../models/TestExecution.js';
import Automation from '../models/Automation.js';
import { sendEmail } from './emailService.js';

// In-memory scheduler for delayed executions
const scheduledJobs = new Map();

/**
 * Start test execution of an automation
 * @param {string} automationId - Automation ID
 * @param {string} email - Test email address
 * @returns {Promise<Object>} Execution object
 */
export async function startTestExecution(automationId, email) {
    // Create execution record
    const execution = new TestExecution({
        automationId,
        email,
        status: 'pending'
    });
    await execution.save();

    // Start execution asynchronously (don't wait)
    executeAutomation(execution._id.toString()).catch(err => {
        console.error('Execution failed:', err);
    });

    return execution;
}

/**
 * Execute automation flow
 * @param {string} executionId - Test execution ID
 */
export async function executeAutomation(executionId) {
    try {
        const execution = await TestExecution.findById(executionId);
        if (!execution) {
            throw new Error('Execution not found');
        }

        const automation = await Automation.findById(execution.automationId);
        if (!automation) {
            throw new Error('Automation not found');
        }

        // Build graph for navigation
        const graph = buildGraph(automation.nodes, automation.edges);

        // Find start node
        const startNode = automation.nodes.find(n => n.type === 'start');
        if (!startNode) {
            throw new Error('Start node not found');
        }

        // Begin execution from start node
        let currentNodeId = startNode.id;

        while (currentNodeId) {
            const node = automation.nodes.find(n => n.id === currentNodeId);
            if (!node) {
                throw new Error(`Node ${currentNodeId} not found`);
            }

            // Update execution status
            await TestExecution.findByIdAndUpdate(executionId, {
                status: 'running',
                currentNodeId
            });

            console.log(`Executing node: ${node.type} (${node.id})`);

            try {
                // Execute node based on type
                switch (node.type) {
                    case 'start':
                        await logExecution(executionId, node.id, node.type, 'Flow started');
                        break;

                    case 'action':
                        const messageId = await sendEmail(execution.email, node.data.message);
                        await logExecution(
                            executionId,
                            node.id,
                            node.type,
                            `Email sent: "${node.data.message.substring(0, 50)}..." (ID: ${messageId})`
                        );
                        break;

                    case 'delay':
                        const delayMs = calculateDelay(node.data);
                        if (delayMs > 0) {
                            await logExecution(
                                executionId,
                                node.id,
                                node.type,
                                `Delaying for ${formatDelay(node.data)}`
                            );
                            // Schedule continuation and exit
                            await scheduleExecution(executionId, currentNodeId, delayMs);
                            return;
                        }
                        break;

                    case 'condition':
                        const conditionResult = evaluateCondition(node.data, execution.email);
                        await logExecution(
                            executionId,
                            node.id,
                            node.type,
                            `Condition evaluated to: ${conditionResult ? 'TRUE' : 'FALSE'}`
                        );

                        // Find the appropriate edge based on condition result
                        const conditionEdge = graph.edges.find(e =>
                            e.source === currentNodeId &&
                            e.sourceHandle === (conditionResult ? 'true' : 'false')
                        );

                        if (conditionEdge) {
                            currentNodeId = conditionEdge.target;
                            continue; // Skip the normal edge finding below
                        } else {
                            throw new Error(`No ${conditionResult ? 'TRUE' : 'FALSE'} path found for condition node`);
                        }

                    case 'end':
                        await logExecution(executionId, node.id, node.type, 'Flow completed successfully');
                        await TestExecution.findByIdAndUpdate(executionId, {
                            status: 'completed',
                            completedAt: new Date()
                        });
                        console.log(`✅ Execution ${executionId} completed`);
                        return;

                    default:
                        throw new Error(`Unknown node type: ${node.type}`);
                }

                // Move to next node (for non-condition nodes)
                const nextEdge = graph.edges.find(e => e.source === currentNodeId);
                if (nextEdge) {
                    currentNodeId = nextEdge.target;
                } else {
                    // No next edge and not an end node - this is an error
                    if (node.type !== 'end') {
                        throw new Error(`No outgoing edge from node ${currentNodeId}`);
                    }
                    currentNodeId = null;
                }

            } catch (error) {
                await logExecution(executionId, node.id, node.type, error.message, true);
                throw error;
            }
        }

    } catch (error) {
        console.error(`❌ Execution ${executionId} failed:`, error.message);
        await TestExecution.findByIdAndUpdate(executionId, {
            status: 'failed',
            completedAt: new Date()
        });
    }
}

/**
 * Build graph structure from nodes and edges
 */
function buildGraph(nodes, edges) {
    return {
        nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
        edges: edges.map(e => ({
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle
        }))
    };
}

/**
 * Calculate delay in milliseconds
 */
function calculateDelay(delayData) {
    if (delayData.mode === 'absolute') {
        const delayTime = new Date(delayData.absoluteTime);
        const now = new Date();
        return Math.max(0, delayTime - now);
    } else if (delayData.mode === 'relative') {
        const units = {
            minutes: 60 * 1000,
            hours: 60 * 60 * 1000,
            days: 24 * 60 * 60 * 1000
        };
        return delayData.relativeValue * units[delayData.relativeUnit];
    }
    return 0;
}

/**
 * Format delay for logging
 */
function formatDelay(delayData) {
    if (delayData.mode === 'absolute') {
        return `until ${new Date(delayData.absoluteTime).toLocaleString()}`;
    } else {
        return `${delayData.relativeValue} ${delayData.relativeUnit}`;
    }
}

/**
 * Evaluate condition rules
 */
function evaluateCondition(conditionData, email) {
    const { rules, logic } = conditionData;

    const results = rules.map(rule => {
        const value = rule.value.toLowerCase();
        const emailLower = email.toLowerCase();

        switch (rule.operator) {
            case 'equals':
                return emailLower === value;
            case 'not_equals':
                return emailLower !== value;
            case 'includes':
                return emailLower.includes(value);
            case 'starts_with':
                return emailLower.startsWith(value);
            case 'ends_with':
                return emailLower.endsWith(value);
            default:
                return false;
        }
    });

    return logic === 'AND'
        ? results.every(r => r)
        : results.some(r => r);
}

/**
 * Schedule execution continuation after delay
 */
async function scheduleExecution(executionId, currentNodeId, delayMs) {
    const resumeTime = new Date(Date.now() + delayMs);

    // Persist scheduled state
    await TestExecution.findByIdAndUpdate(executionId, {
        status: 'pending',
        currentNodeId,
        scheduledFor: resumeTime
    });

    console.log(`⏰ Scheduled execution ${executionId} to resume in ${delayMs}ms at ${resumeTime.toLocaleString()}`);

    // Schedule in-memory
    const timeoutId = setTimeout(async () => {
        console.log(`⏰ Resuming execution ${executionId}`);

        // Move to next node after delay
        const execution = await TestExecution.findById(executionId);
        const automation = await Automation.findById(execution.automationId);
        const graph = buildGraph(automation.nodes, automation.edges);

        // Find next node after the delay node
        const nextEdge = graph.edges.find(e => e.source === currentNodeId);
        if (nextEdge) {
            // Update current node to next node
            await TestExecution.findByIdAndUpdate(executionId, {
                currentNodeId: nextEdge.target,
                scheduledFor: null
            });
        }

        // Continue execution
        await executeAutomation(executionId);
        scheduledJobs.delete(executionId);
    }, delayMs);

    scheduledJobs.set(executionId, timeoutId);
}

/**
 * Log execution step
 */
async function logExecution(executionId, nodeId, nodeType, message, isError = false) {
    const logEntry = {
        nodeId,
        nodeType,
        timestamp: new Date(),
        status: isError ? 'failed' : 'success',
        [isError ? 'error' : 'message']: message
    };

    await TestExecution.findByIdAndUpdate(executionId, {
        $push: { executionLog: logEntry }
    });
}

/**
 * Resume pending executions on server restart
 */
export async function resumePendingExecutions() {
    try {
        const pending = await TestExecution.find({
            status: 'pending',
            scheduledFor: { $exists: true, $ne: null }
        });

        console.log(`📋 Found ${pending.length} pending executions to resume`);

        for (const execution of pending) {
            const delayMs = Math.max(0, new Date(execution.scheduledFor) - new Date());
            console.log(`   Resuming execution ${execution._id} in ${delayMs}ms`);
            await scheduleExecution(
                execution._id.toString(),
                execution.currentNodeId,
                delayMs
            );
        }
    } catch (error) {
        console.error('Failed to resume pending executions:', error);
    }
}
