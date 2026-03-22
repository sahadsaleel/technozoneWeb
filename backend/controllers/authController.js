const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Shop = require('../models/Shop');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate random 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register a new user & create their shop
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, shopName, phone } = req.body;

    if (!name || !email || !password || !shopName) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a generic shop for the new user (they are the owner)
    // In local DB, we can let the utility generate IDs or handle it here
    const shop = await Shop.create({
      name: shopName,
      owner: null, // Will update after user creation or vice-versa
      phone: phone || ''
    });

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      shopId: shop._id,
      role: 'admin'
    });

    // Update shop owner
    await Shop.findByIdAndUpdate(shop._id, { owner: user._id });

    if (user) {
      res.status(201).json({
        message: 'User registered successfully. Please login.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('REGISTRATION ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

// @desc    Authenticate a user & send OTP
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate OTP
      const otp = generateOTP();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      await User.findByIdAndUpdate(user._id, { 
        otp, 
        otpExpires 
      });

      // Send OTP via email (Non-blocking to prevent UI hang)
      try {
        if(process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD && process.env.EMAIL_USERNAME !== 'your_email@gmail.com') {
          // Fire and forget (don't await) to prevent blocking the response
          sendEmail({
             email: user.email,
             subject: 'TechnoZone - Login OTP Verification',
             message: `Your OTP for login is: ${otp}. It is valid for 10 minutes.`,
             html: `<p>Your OTP for TechnoZone login is: <b>${otp}</b></p><p>It is valid for 10 minutes.</p>`
          }).catch(err => console.error('Delayed Email Error:', err));
          
          console.log(`OTP sending initiated for ${email}`);
        } else {
           console.log(`DEV MODE: OTP for ${email} is ${otp}`);
        }
      } catch(err) {
        console.error('Email initiation failed', err);
      }

      res.json({
        requiresOTP: true,
        message: 'OTP sent to email'
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    
    await User.findByIdAndUpdate(user._id, { 
      otp, 
      otpExpires 
    });

    // Send OTP via email (Non-blocking)
    try {
      if(process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD && process.env.EMAIL_USERNAME !== 'your_email@gmail.com') {
        sendEmail({
           email: user.email,
           subject: 'TechnoZone - Resent OTP Verification',
           message: `Your new OTP for login is: ${otp}`,
           html: `<p>Your new OTP for TechnoZone login is: <b>${otp}</b></p>`
        }).catch(err => console.error('Delayed Resend Email Error:', err));

        console.log(`OTP resending initiated for ${email}`);
      } else {
        console.log(`DEV MODE: OTP resent for ${email} is ${otp}`);
      }
    } catch(err) {
      console.error('Email resend initiation failed', err);
    }

    res.json({ 
      message: 'New OTP sent'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP for login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await User.findByIdAndUpdate(user._id, {
      otp: null,
      otpExpires: null,
      isVerified: true
    });

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: user.shopId
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP
};
