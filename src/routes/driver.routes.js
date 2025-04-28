const express = require('express');
const router = express.Router();
const driverAuthController = require('../controllers/driverAuth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Import your controller functions for driver
const driverController = require('../controllers/driver.controller');

// POST /api/v1/drivers/send-otp
router.post('/send-otp', driverAuthController.sendOTP);

// POST /api/v1/drivers/verify-otp
router.post('/verify-otp', driverAuthController.verifyOTP);


// Driver registration and profile routes
router.post('/complete-registration', authenticate, driverController.completeRegistration);
router.get('/profile', authenticate, driverController.getProfile);


module.exports = router;
