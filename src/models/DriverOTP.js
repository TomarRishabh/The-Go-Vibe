// models/DriverOTP.js
const mongoose = require('mongoose');

const DriverOTPSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('DriverOTP', DriverOTPSchema);
