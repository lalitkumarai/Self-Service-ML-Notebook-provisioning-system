const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true }, // bytes
  mimetype: { type: String },
  path: { type: String, required: true }, // server-side path
  rows: { type: Number, default: 0 },
  columns: { type: Number, default: 0 },
  preview: { type: [[String]], default: [] }, // first 5 rows as 2D array
  headers: { type: [String], default: [] },
  linkedNotebooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notebook' }],
}, { timestamps: true });

module.exports = mongoose.model('Dataset', datasetSchema);
