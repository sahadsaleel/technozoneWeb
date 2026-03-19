require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
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

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Serve static files from the frontend/dist directory
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Wildcard route to serve index.html for all non-API requests (SPA fallback)
app.get('/*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} (MongoDB)`);
});