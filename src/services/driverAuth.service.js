const jwt = require('jsonwebtoken');
const Driver = require('../models/driver.model');
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;


exports.getDriverByMobileNumber = async (mobileNumber) => {
  return Driver.findOne({ mobileNumber });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

exports.createDriver = async (mobileNumber) => {
  return Driver.create({ mobileNumber });
};

exports.generateToken = (driverId) => {
  return jwt.sign({ id: driverId }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};
