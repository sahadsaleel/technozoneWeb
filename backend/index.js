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

// Routes
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TechnoZone API is running with MongoDB' });
});

// Root Route
app.get('/', (req, res) => {
  res.send('🚀 TechnoZone API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} (MongoDB)`);
  
  // Diagnostic check for Email credentials
  if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
    console.log(`✅ Email configuration found: ${process.env.EMAIL_USERNAME}`);
  } else {
    console.log('❌ CRITICAL: Email configuration MISSING (Check Environment Variables)');
  }
});