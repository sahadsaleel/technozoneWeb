require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const fs = require('fs');

// Middleware
app.use(cors({
  origin: '*', // For now keep it open, but allow specific headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TechnoZone API is running with MongoDB' });
});

// Root Route (with simple test form)
app.get('/', (req, res) => {
  res.send(`
    <style>body{font-family:sans-serif;padding:2rem;line-height:1.5;}</style>
    <h1>🚀 TechnoZone API is running</h1>
    <p>Status: <b>Live</b></p>
    <hr/>
    <h3>Diagnostic Email Test</h3>
    <form action="/api/auth/test-email" method="POST">
      <input type="email" name="email" placeholder="enter your email" required style="padding:0.5rem;width:250px;">
      <button type="submit" style="padding:0.5rem 1rem;cursor:pointer;">Send Test Email</button>
    </form>
    <p><small>Check Render logs if the test fails.</small></p>
  `);
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} (MongoDB)`);
  
  // Diagnostic check for Email credentials
  if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
    console.log(`✅ Email configuration found: ${process.env.EMAIL_USERNAME}`);
    
    // Test network connectivity to Gmail SMTP
    const net = require('net');
    
    // Check Port 587
    const client587 = net.connect(587, 'smtp.gmail.com', () => {
      console.log('✅ Network connectivity: Able to reach smtp.gmail.com on port 587');
      client587.end();
    });
    client587.on('error', (err) => {
      console.log(`❌ Network connectivity FAILURE: Cannot reach smtp.gmail.com:587 - ${err.message}`);
    });
    client587.setTimeout(5000, () => {
      console.log('❌ Network connectivity TIMEOUT: smtp.gmail.com:587 is unreachable');
      client587.destroy();
    });

    // Check Port 465
    const client465 = net.connect(465, 'smtp.gmail.com', () => {
      console.log('✅ Network connectivity: Able to reach smtp.gmail.com on port 465');
      client465.end();
    });
    client465.on('error', (err) => {
      console.log(`❌ Network connectivity FAILURE: Cannot reach smtp.gmail.com:465 - ${err.message}`);
    });
    client465.setTimeout(5000, () => {
      console.log('❌ Network connectivity TIMEOUT: smtp.gmail.com:465 is unreachable');
      client465.destroy();
    });

  } else {
    console.log('❌ CRITICAL: Email configuration MISSING (Check Environment Variables)');
  }
});