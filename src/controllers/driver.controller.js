const Driver = require('../models/driver.model');
const Vehicle = require('../models/vehicle.model');

// Complete driver registration
exports.completeRegistration = async (req, res) => {
  try {
    const { name, email, licenseNumber } = req.body;
    const driverId = req.user.id;

    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { name, email, licenseNumber, registrationCompleted: true },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        driver: updatedDriver
      }
    });
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete registration'
    });
  }
};

// Get driver profile
exports.getProfile = async (req, res) => {
  try {
    const driverId = req.user.id;
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        status: 'fail',
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        driver
      }
    });
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch driver profile'
    });
  }
};

// Add a vehicle
exports.addVehicle = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { make, model, year, color, licensePlate, vehicleType } = req.body;

    const vehicle = await Vehicle.create({
      driver: driverId,
      make,
      model,
      year,
      color,
      licensePlate,
      vehicleType
    });

    res.status(201).json({
      status: 'success',
      data: {
        vehicle
      }
    });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add vehicle'
    });
  }
};

// Get all vehicles for a driver
exports.getVehicles = async (req, res) => {
  try {
    const driverId = req.user.id;
    const vehicles = await Vehicle.find({ driver: driverId });

    res.status(200).json({
      status: 'success',
      results: vehicles.length,
      data: {
        vehicles
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch vehicles'
    });
  }
};

// Update a vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const driverId = req.user.id;
    const { make, model, year, color, licensePlate, vehicleType } = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, driver: driverId },
      { make, model, year, color, licensePlate, vehicleType },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        status: 'fail',
        message: 'Vehicle not found or you do not have permission to update it'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        vehicle
      }
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update vehicle'
    });
  }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const driverId = req.user.id;

    const vehicle = await Vehicle.findOneAndDelete({ _id: vehicleId, driver: driverId });

    if (!vehicle) {
      return res.status(404).json({
        status: 'fail',
        message: 'Vehicle not found or you do not have permission to delete it'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete vehicle'
    });
  }
};
