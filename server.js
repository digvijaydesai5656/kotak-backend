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

// Kotak Login Route
app.post('/api/kotak-login', apiLimiter, async (req, res, next) => {
  const { mobileNumber, ucc, totp } = req.body;

  // Basic validation
  if (!mobileNumber || !ucc || !totp) {
    return res.status(400).json({ error: 'All fields (mobileNumber, ucc, totp) are required.' });
  }

  try {
    const kotakResponse = await axios.post(
      'https://mis.kotaksecurities.com/login/1.0/tradeApiLogin',
      {
        mobileNumber,
        ucc,
        totp
      },
      {
        headers: {
          'Authorization': process.env.KOTAK_ACCESS_TOKEN,
          'neo-fin-key': 'neotradeapi',
          'Content-Type': 'application/json'
        }
      }
    );

    // Send Kotak API response back to frontend (session token, user details, etc.)
    return res.status(kotakResponse.status).json(kotakResponse.data);

  } catch (error) {
    next(error);
  }
});

// Step 2B: Validate MPIN
app.post('/api/kotak-validate', apiLimiter, async (req, res, next) => {
  const { mpin, sid, token } = req.body;

  // Basic validation
  if (!mpin || !sid || !token) {
    return res.status(400).json({
      error: 'Missing required parameters: mpin, sid, and token are required.'
    });
  }

  try {
    const kotakResponse = await axios.post(
      'https://mis.kotaksecurities.com/login/1.0/tradeApiValidate',
      { mpin },
      {
        headers: {
          'Authorization': process.env.KOTAK_ACCESS_TOKEN,
          'neo-fin-key': 'neotradeapi',
          'sid': sid,
          'Auth': token,
          'Content-Type': 'application/json'
        }
      }
    );

    // kotakResponse.data contains trade session tokens (sessionToken/jwt, etc.)
    return res.status(kotakResponse.status).json(kotakResponse.data);

  } catch (error) {
    next(error);
  }
});

// Step 3: Fetch Scrip Master CSV download links
app.get('/api/kotak/scrip-files', async (req, res, next) => {
    try {
        const response = await axios.get(
            'https://mis.kotaksecurities.com/script-details/1.0/masterscrip/file-paths',
            {
                headers: {
                    'Authorization': process.env.KOTAK_ACCESS_TOKEN
                }
            }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        next(error);
    }
});

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