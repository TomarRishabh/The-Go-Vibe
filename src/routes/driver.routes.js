const express = require('express');
const router = express.Router();
const driverAuthController = require('../controllers/driverAuth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
// Add this line to import the middleware
const driverAuthMiddleware = require('../middlewares/driverAuth.middleware');

// Import your controller functions for driver
const driverController = require('../controllers/driver.controller');

// POST /api/v1/drivers/send-otp
router.post('/send-otp', driverAuthController.sendOTP);

// POST /api/v1/drivers/verify-otp
router.post('/verify-otp', driverAuthController.verifyOTP);

// Driver registration and profile routes
router.post('/complete-registration', authenticate, driverController.completeRegistration);
router.post('/complete-registration', driverAuthMiddleware, driverAuthController.completeRegistration);
router.get('/profile', authenticate, driverController.getProfile);

// Vehicle management routes
router.post('/vehicle', authenticate, driverController.addVehicle);
router.get('/vehicle', authenticate, driverController.getVehicles);
router.put('/vehicle/:id', authenticate, driverController.updateVehicle);
router.delete('/vehicle/:id', authenticate, driverController.deleteVehicle);

// Add this if you're in development mode:

// Development-only routes
if (process.env.NODE_ENV === 'development') {
  router.get('/dev/otps', async (req, res) => {
    try {
      const otps = await DriverOTP.find().lean();
      res.json({
        count: otps.length,
        otps
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = router;
