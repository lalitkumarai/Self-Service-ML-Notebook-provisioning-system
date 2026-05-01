const express = require('express');
const router = express.Router();
const { 
    createNotebook, 
    getNotebooks, 
    deleteNotebook, 
    reconnectNotebook,
    stopNotebook,
    saveNotebookContent,
    getNotebookContent,
    getSystemStatus
} = require('../controllers/notebookController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, createNotebook);
router.get('/list', authenticateToken, getNotebooks);
router.get('/system-status', authenticateToken, authorizeRole('admin'), getSystemStatus);
router.delete('/delete/:id', authenticateToken, deleteNotebook);
router.post('/reconnect/:id', authenticateToken, reconnectNotebook);
router.post('/stop/:id',      authenticateToken, stopNotebook);
router.get('/:id/content', authenticateToken, getNotebookContent);
router.post('/:id/content', authenticateToken, saveNotebookContent);

module.exports = router;
