const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Shop = require('../models/Shop');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

// Utility Functions
const hash_password = async (password) => {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return await bcrypt.hash(password, salt);
};

const verify_password = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

const create_access_token = (user_id) => {
  return jwt.sign({ id: user_id }, JWT_SECRET, { expiresIn: '15m' });
};

const create_refresh_token = (user_id) => {
  return jwt.sign({ id: user_id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user & create their shop
// @route   POST /auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, password, confirm_password, shopName } = req.body;

    if (!username || !password || !confirm_password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (username.length < 3 || /\s/.test(username)) {
      return res.status(400).json({ message: 'Username must be at least 3 characters and contain no spaces' });
    }

    if (password.length < 6 || !/\d/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters and contain a number' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const usernameLower = username.toLowerCase();
    const existingUser = await User.findOne({ username: usernameLower });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const password_hash = await hash_password(password);

    const shop = await Shop.create({
      name: shopName || `${username}'s Shop`,
      owner: null,
      phone: ''
    });

    const user = await User.create({
      username: usernameLower,
      password_hash: password_hash,
      shopId: shop._id,
      role: 'admin'
    });

    await Shop.findByIdAndUpdate(shop._id, { owner: user._id });

    const access_token = create_access_token(user._id);
    const refresh_token = create_refresh_token(user._id);

    res.status(201).json({
      message: 'Account created',
      access_token,
      refresh_token
    });
  } catch (error) {
    console.error('REGISTRATION ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await verify_password(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const access_token = create_access_token(user._id);
    const refresh_token = create_refresh_token(user._id);

    res.json({
      access_token,
      refresh_token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user (invalidate session)
// @route   POST /auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  try {
    // In a fully stateless JWT system, true invalidation requires a Redis blacklist
    // Since we are strictly replacing OTP, we mock the invalidation logic by terminating the client session
    res.json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user info
// @route   GET /auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password_hash');
    
    if (!user) {
      return res.status(401).json({ message: 'User mapping lost' });
    }

    res.json({
      id: user._id,
      username: user.username,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('TOKEN VERIFICATION ERROR:', error);
    return res.status(401).json({ message: 'Not authorized - Token failed' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe
};
