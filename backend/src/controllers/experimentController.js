const Experiment = require('../models/Experiment');

// POST /api/experiments - log a new experiment
const createExperiment = async (req, res) => {
  try {
    const { name, description, framework, parameters, metrics, trainingTime, tags, notes, notebookId } = req.body;
    const experiment = await Experiment.create({
      userId: req.user.id,
      notebookId,
      name,
      description,
      framework,
      parameters,
      metrics,
      trainingTime,
      tags,
      notes,
    });
    res.status(201).json({ success: true, experiment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/experiments - list user's experiments
const getExperiments = async (req, res) => {
  try {
    const experiments = await Experiment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, experiments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/experiments/:id
const deleteExperiment = async (req, res) => {
  try {
    const exp = await Experiment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!exp) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createExperiment, getExperiments, deleteExperiment };
