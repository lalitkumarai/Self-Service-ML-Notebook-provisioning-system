const express = require('express');
const router = express.Router();
const { upload, uploadDataset, getDatasets, deleteDataset } = require('../controllers/datasetController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/upload', authenticateToken, upload.single('file'), uploadDataset);
router.get('/', authenticateToken, getDatasets);
router.delete('/:id', authenticateToken, deleteDataset);

module.exports = router;
