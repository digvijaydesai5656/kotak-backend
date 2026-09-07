const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Ensure critical environment variables are loaded
if (!process.env.KOTAK_ACCESS_TOKEN) {
  console.error("FATAL ERROR: KOTAK_ACCESS_TOKEN is not defined in environment variables.");
  process.exit(1);
}

const app = express();

// Middleware
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin
}));
app.use(express.json());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after a minute.' }
});

const kotakRoutes = require('./routes/kotakRoutes');
app.use('/api', apiLimiter, kotakRoutes);

// Global Error Handling Middleware
app.use((error, req, res, next) => {
  if (error.response) {
    console.error('Kotak API Error:', error.response.data);
    return res.status(error.response.status).json(error.response.data);
  }

  console.error('Server Error:', error.message);
  return res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});