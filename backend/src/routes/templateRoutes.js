const express = require('express');
const router = express.Router();
const { getTemplates, getTemplate } = require('../controllers/templateController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getTemplates);
router.get('/:id', authenticateToken, getTemplate);

module.exports = router;
