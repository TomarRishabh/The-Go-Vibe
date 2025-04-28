// driverAuth.controller.js
const driverOtpService = require('../services/driverOtp.service');
const { generateToken } = require('../services/driverAuth.service');
const driverAuthService = require('../services/driverAuth.service');
exports.sendOTP = async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        // Call the sendOTP service to send OTP
        const response = await driverOtpService.sendOTP(phone);

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        await driverOtpService.verifyOTP(phone, otp);

        let driver = await driverAuthService.getDriverByMobileNumber(phone);
        if (!driver) {
            // Create new driver if doesn't exist
            driver = await driverAuthService.createDriver(phone);
        }

        const token = generateToken(driver._id);

        res.status(200).json({
            success: true,
            token,
            isRegistered: driver.isRegistered,
            message: 'OTP verified successfully',
        });
    } 
    catch (error) {
        next(error);
    }
};
