const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  notebookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notebook' },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  framework: { type: String, default: 'PyTorch' }, // PyTorch, TensorFlow, Sklearn
  parameters: {
    learningRate: { type: Number },
    epochs: { type: Number },
    batchSize: { type: Number },
    optimizer: { type: String },
    customParams: { type: Object, default: {} }
  },
  metrics: {
    accuracy: { type: Number },
    loss: { type: Number },
    valAccuracy: { type: Number },
    valLoss: { type: Number },
    f1Score: { type: Number },
    customMetrics: { type: Object, default: {} }
  },
  trainingTime: { type: Number, default: 0 }, // seconds
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'completed' },
  tags: { type: [String], default: [] },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Experiment', experimentSchema);
