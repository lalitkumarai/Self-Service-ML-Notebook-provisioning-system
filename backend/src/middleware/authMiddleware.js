const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded.userId matches the payload in authController.js
      req.user = await User.findById(decoded.userId).select('-password -refreshToken');

      if (!req.user) {
        console.log('Auth Failed: User not found for ID:', decoded.userId);
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      next();
    } catch (error) {
      console.error('Auth Failed: Token verification error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('Auth Failed: No token provided in headers');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
