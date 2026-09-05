const express = require('express');
const axios = require('axios');
const router = express.Router();

const NEO_BASE_URL = 'https://gw-napi.kotaksecurities.com'; // Kotak Neo Base URL

// Helper: Get Consumer Access Token using Consumer Key & Secret
async function getApplicationToken() {
  const auth = Buffer.from(
    `${process.env.KOTAK_CONSUMER_KEY}:${process.env.KOTAK_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await axios.post(
    `${NEO_BASE_URL}/oauth/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return res.data.access_token;
}

// 1. Initial Login
router.post('/login', async (req, res) => {
  const { mobileNumber, password } = req.body;

  try {
    const appToken = await getApplicationToken();

    // Call Kotak Neo Login endpoint
    const response = await axios.post(
      `${NEO_BASE_URL}/login/1.0/login/v2/validate`,
      {
        mobileNumber: mobileNumber,
        password: password,
      },
      {
        headers: {
          Authorization: `Bearer ${appToken}`,
          'neo-fin-key': 'neotrade',
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      data: {
        ...response.data.data,
        appToken, // Pass token internally to use in next step
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.response?.data?.message || 'Login failed',
    });
  }
});

// 2. Validate 2FA (TOTP / OTP)
router.post('/verify-2fa', async (req, res) => {
  const { otp, sessionData } = req.body;

  try {
    const response = await axios.post(
      `${NEO_BASE_URL}/login/1.0/login/v2/validate/otp`,
      {
        otp: otp,
        userId: sessionData?.userId,
      },
      {
        headers: {
          Authorization: `Bearer ${sessionData?.appToken}`,
          'neo-fin-key': 'neotrade',
          sid: sessionData?.sid,
          Auth: sessionData?.token,
          'Content-Type': 'application/json',
        },
      }
    );

    // This token can now be used for placing trades, streaming, etc.
    res.json({
      success: true,
      token: response.data.data.token,
      userDetails: response.data.data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.response?.data?.message || 'Invalid 2FA code',
    });
  }
});

module.exports = router;