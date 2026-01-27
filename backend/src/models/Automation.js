import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['start', 'end', 'action', 'delay', 'condition']
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    // Action node fields
    message: { type: String },

    // Delay node fields
    mode: { type: String, enum: ['absolute', 'relative'] },
    absoluteTime: { type: Date },
    relativeValue: { type: Number },
    relativeUnit: { type: String, enum: ['minutes', 'hours', 'days'] },

    // Condition node fields
    rules: [{
      field: { type: String, default: 'email' },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'includes', 'starts_with', 'ends_with']
      },
      value: { type: String }
    }],
    logic: { type: String, enum: ['AND', 'OR'], default: 'AND' }
  }
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceHandle: { type: String },
  targetHandle: { type: String }
}, { _id: false });

const automationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  nodes: [nodeSchema],
  edges: [edgeSchema]
}, {
  timestamps: true
});

// Index is already created by unique: true in schema definition
// automationSchema.index({ name: 1 }, { unique: true });

const Automation = mongoose.model('Automation', automationSchema);

export default Automation;
