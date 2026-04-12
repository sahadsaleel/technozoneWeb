require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.set('trust proxy', 1); // ← add this line

const fs = require('fs');

// Middleware
app.use(cors({
  origin: '*',
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

app.get('/', (req, res) => {
  res.send(`
    <style>body{font-family:sans-serif;padding:2rem;line-height:1.5;}</style>
    <h1>🚀 TechnoZone API is running</h1>
    <p>Status: <b>Live</b></p>
  `);
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} (MongoDB)`);
});