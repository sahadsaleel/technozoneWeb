const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, logoutUser, getMe } = require('../controllers/authController');

// Rate Limiter: 5 Login Attempts per IP per minute
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // Limit each IP to 5 requests per `window`
  message: { message: 'Too many login attempts from this IP, please try again after a minute' },
  standardHeaders: true, 
  legacyHeaders: false,
});

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', getMe);

module.exports = router;
