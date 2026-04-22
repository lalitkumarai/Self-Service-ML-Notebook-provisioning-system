const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, authUser, authOAuthCallback, refreshToken, getUsers, deleteUser, logoutUser, updateUserQuota } = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Rate limiting to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 accounts per hour
    message: { message: 'Too many accounts created from this IP, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, authUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);
router.get('/oauth/callback', authOAuthCallback);
router.get('/users', authenticateToken, authorizeRole('admin'), getUsers);
router.put('/users/:id/quota', authenticateToken, authorizeRole('admin'), updateUserQuota);
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), deleteUser);

module.exports = router;
