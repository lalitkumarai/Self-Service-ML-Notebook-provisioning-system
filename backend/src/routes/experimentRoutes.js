const express = require('express');
const router = express.Router();
const { createExperiment, getExperiments, deleteExperiment } = require('../controllers/experimentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createExperiment);
router.get('/', authenticateToken, getExperiments);
router.delete('/:id', authenticateToken, deleteExperiment);

module.exports = router;
