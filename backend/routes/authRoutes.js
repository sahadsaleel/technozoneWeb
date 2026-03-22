const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOTP, resendOTP, testEmail } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/test-email', testEmail);

module.exports = router;
