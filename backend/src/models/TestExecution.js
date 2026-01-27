import mongoose from 'mongoose';

const executionLogSchema = new mongoose.Schema({
    nodeId: { type: String, required: true },
    nodeType: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['success', 'failed'], required: true },
    message: { type: String },
    error: { type: String }
}, { _id: false });

const testExecutionSchema = new mongoose.Schema({
    automationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Automation',
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'running', 'completed', 'failed'],
        default: 'pending'
    },
    currentNodeId: { type: String },
    executionLog: [executionLogSchema],
    scheduledFor: { type: Date },
    completedAt: { type: Date }
}, {
    timestamps: true
});

const TestExecution = mongoose.model('TestExecution', testExecutionSchema);

export default TestExecution;
