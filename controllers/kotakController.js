const axios = require('axios');

exports.login = async (req, res, next) => {
  const { mobileNumber, ucc, totp } = req.body;

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
          'neo-fin-key': 'neotradeapi'
        }
      }
    );

    return res.status(kotakResponse.status).json(kotakResponse.data);

  } catch (error) {
    next(error);
  }
};

exports.validate = async (req, res, next) => {
  const { mpin, sid, token } = req.body;

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
          'Auth': token
        }
      }
    );

    return res.status(kotakResponse.status).json(kotakResponse.data);

  } catch (error) {
    next(error);
  }
};

exports.getScripFiles = async (req, res, next) => {
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
};

exports.placeOrder = async (req, res, next) => {
  const { sid, token, baseUrl, ...orderData } = req.body;

  if (!sid || !token || !baseUrl) {
    return res.status(400).json({ error: 'Missing sid, token, or baseUrl in request body.' });
  }

  try {
    const jData = JSON.stringify(orderData);
    const formData = new URLSearchParams();
    formData.append('jData', jData);

    const kotakResponse = await axios.post(
      `${baseUrl}/quick/order/rule/ms/place`,
      formData,
      {
        headers: {
          'accept': 'application/json',
          'Sid': sid,
          'Auth': token,
          'neo-fin-key': 'neotradeapi',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return res.status(kotakResponse.status).json(kotakResponse.data);
  } catch (error) {
    next(error);
  }
};
