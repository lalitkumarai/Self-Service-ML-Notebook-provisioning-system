const mongoose = require('mongoose');

const notebookSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  // notebookId will be the default _id
  name: { type: String, required: true },
  podName: { type: String, required: true },
  pvcName: { type: String, required: true },
  cpu: { type: String, required: true, default: '500m' },
  memory: { type: String, required: true, default: '1Gi' },
  storage: { type: String, required: true, default: '1Gi' },
  gpu: { type: Boolean, default: false },
  gitRepo: { type: String, default: '' },
  framework: { type: String, default: 'Python' },
  datasetName: { type: String, default: '' },
  datasetSource: { type: String, default: '' },
  tags: { type: [String], default: [] },
  description: { type: String, default: '' },
  lastRun: {
    runId: { type: String },
    status: { type: String, default: 'Idle' },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    durationMs: { type: Number },
    metrics: { type: Object, default: {} }
  },
  runs: [
    {
      runId: { type: String },
      status: { type: String },
      startedAt: { type: Date },
      finishedAt: { type: Date },
      durationMs: { type: Number },
      metrics: { type: Object, default: {} },
      artifacts: { type: [Object], default: [] },
      triggeredBy: { type: String, default: '' }
    }
  ],
  autoShutdown: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  status: { type: String, required: true, default: 'Pending' }, // Pending, Running, Stopped, Error, Terminating
  accessURL: { type: String },
  namespace: { type: String, default: 'default' },
}, {
  timestamps: true,
});

const Notebook = mongoose.model('Notebook', notebookSchema);

module.exports = Notebook;
