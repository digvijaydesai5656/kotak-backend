const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allows requests from React app
app.use(express.json());

// Kotak Login Route
app.post('/api/kotak-login', async (req, res) => {
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
        // Forward error from Kotak API if available
        if (error.response) {
            console.error('Kotak API Error:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        
        console.error('Server Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});