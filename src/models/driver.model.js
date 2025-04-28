const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  aadharCard: {
    type: String,
    required: true,
  },
  panCard: {
    type: String,
    required: true,
  },
  drivingLicense: {
    type: String,
    required: true,
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
