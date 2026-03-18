require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('TechnoZone Backend API is Running (MongoDB)');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TechnoZone API is running with MongoDB' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} (MongoDB)`);
});