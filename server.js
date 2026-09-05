require('dotenv').config();

const express = require('express');
const cors = require('cors');
const kotakNeoRouter = require('./routes/kotakNeo');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Kotak backend is running',
  });
});

app.use('/api/kotak-neo', kotakNeoRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(port, () => {
  console.log(`Kotak backend listening on http://localhost:${port}`);
});
