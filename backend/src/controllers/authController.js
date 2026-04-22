const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      role: user.role, 
      email: user.email 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      role: user.role, 
      email: user.email 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    res.json({ message: 'Please provide all required fields' });
    return;
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    res.json({ message: 'User already exists' });
    return;
  }

  // Security Note: Allowing public registration of 'admin' is risky.
  // Ensure this is intended or protected in production.
  const userRole = role === 'admin' ? 'admin' : 'user';

  const user = await User.create({
    username,
    email,
    passwordHash: password, // Will be hashed by pre-save hook
    role: userRole
  });

  if (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: accessToken,
      refreshToken: refreshToken,
    });
  } else {
    res.status(400);
    res.json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);

  const user = await User.findOne({ email });

  if (!user) {
    console.log('Login failed: User not found');
    res.status(401);
    res.json({ message: 'Invalid email or password' });
    return;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    console.log('Login failed: Password mismatch');
    res.status(401);
    res.json({ message: 'Invalid email or password' });
    return;
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  console.log('Login successful');
  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    token: accessToken,
    refreshToken: refreshToken,
  });
};

// @desc    Get new access token
// @route   POST /api/users/refresh
// @access  Public
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user);

    res.json({ token: accessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Logout user
// @route   POST /auth/logout
// @access  Public
const logoutUser = async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
    }
    
    res.json({ message: 'Logged out successfully' });
};

// @desc    OAuth Callback
// @route   GET /api/users/oauth/callback
// @access  Public
const authOAuthCallback = async (req, res) => {
    res.json({ message: 'OAuth not fully implemented. Use Passport.js middleware.' });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

// @desc    Delete user
// @route   DELETE /auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    res.json({ message: 'User not found' });
  }
};

const updateUserQuota = async (req, res) => {
  const { cpu, memory, gpu } = req.body;
  const user = await User.findById(req.params.id);

  if (user) {
    user.quota.cpu = cpu !== undefined ? cpu : user.quota.cpu;
    user.quota.memory = memory !== undefined ? memory : user.quota.memory;
    user.quota.gpu = gpu !== undefined ? gpu : user.quota.gpu;
    
    await user.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      quota: user.quota
    });
  } else {
    res.status(404);
    res.json({ message: 'User not found' });
  }
};

module.exports = { registerUser, authUser, refreshToken, authOAuthCallback, getUsers, deleteUser, logoutUser, updateUserQuota };
