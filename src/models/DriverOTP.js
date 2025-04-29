// models/DriverOTP.js
const mongoose = require('mongoose');

const driverOTPSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpiry: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10m' // Auto-delete after 10 minutes
  }
});

const DriverOTP = mongoose.model('DriverOTP', driverOTPSchema);

module.exports = DriverOTP;
