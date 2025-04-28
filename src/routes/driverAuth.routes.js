const express = require('express');
const router = express.Router();
const driverAuthController = require('../controllers/driverAuth.controller');

// POST /api/v1/drivers/send-otp
router.post('/send-otp', driverAuthController.sendOTP);

// POST /api/v1/drivers/verify-otp
router.post('/verify-otp', driverAuthController.verifyOTP);

module.exports = router;
