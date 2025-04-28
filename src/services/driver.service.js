const Driver = require('../models/driver.model');
const DriverVerification = require('../models/DriverVerification');

exports.completeRegistration = async (driverId, driverData) => {
  const { name, email, dob, gender, aadharCard, panCard, drivingLicense } = driverData;

  const driver = await Driver.findByIdAndUpdate(
    driverId,
    {
      name,
      email,
      dob,
      gender,
      aadharCard,
      panCard,
      drivingLicense,
      isRegistered: true,
    },
    { new: true, runValidators: true }
  );

  if (!driver) {
    throw new Error('Driver not found');
  }

  // Start the verification process for the driver's documents
  const verification = new DriverVerification({
    driverId: driver._id,
    aadharVerified: false,
    panVerified: false,
    licenseVerified: false,
    processingTime: new Date(),
  });
  await verification.save();

  return driver;
};

exports.getDriverProfile = async (driverId) => {
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw new Error('Driver not found');
  }
  return driver;
};

