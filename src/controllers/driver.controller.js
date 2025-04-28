const Driver = require('../models/driver.model');
const driverService = require('../services/driver.service');
// Complete driver registration
// Complete driver registration
exports.completeRegistration = async (req, res, next) => {
    try {
      const driverId = req.user.id;  // get driver ID from token/middleware
      const driverData = req.body;   // get data from frontend
  
      const driver = await driverService.completeRegistration(driverId, driverData);
  
      res.status(201).json({
        success: true,
        data: driver,
        message: 'Driver registration completed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

// Get driver profile
exports.getProfile = async (req, res, next) => {
  try {
    const driverId = req.user.id;  // Assuming you have authentication middleware setting req.user
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};
