const mongoose = require('mongoose');
const { isDevMode } = require('../utils/helpers');

const driverSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: !isDevMode(), // Not strictly required in dev mode
    trim: true,
  },
  email: {
    type: String,
    required: !isDevMode(), // Not strictly required in dev mode
    unique: true,
    trim: true,
    lowercase: true,
  },
  dob: {
    type: Date,
    required: !isDevMode(), // Not strictly required in dev mode
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: !isDevMode(), // Not strictly required in dev mode
  },
  aadharCard: {
    type: String,
    required: !isDevMode(), // Not strictly required in dev mode
  },
  panCard: {
    type: String,
    required: !isDevMode(), // Not strictly required in dev mode
  },
  drivingLicense: {
    type: String,
    required: !isDevMode(), // Not strictly required in dev mode
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  registrationCompleted: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  licenseNumber: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
