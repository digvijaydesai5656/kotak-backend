const express = require('express');
const router = express.Router();
const kotakController = require('../controllers/kotakController');

// Kotak Login Route
router.post('/kotak-login', kotakController.login);

// Validate MPIN
router.post('/kotak-validate', kotakController.validate);

// Fetch Scrip Master CSV download links
router.get('/kotak/scrip-files', kotakController.getScripFiles);

module.exports = router;
