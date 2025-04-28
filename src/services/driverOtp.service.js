// driverOtp.service.js
const DriverOTP = require('../models/DriverOTP');
const { client, twilioPhoneNumber } = require('../config/twilio');
const { generateOTP } = require('../utils/helpers'); // Assume this helper generates OTP

// Send OTP function
exports.sendOTP = async (phone) => {
    try {
        // Generate random OTP (6 digits)
        const otp = generateOTP(6);

        // Save the OTP in the database with an expiration time (e.g., 5 minutes)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        await DriverOTP.create({
            mobileNumber: phone,
            otp,
            expiresAt,
        });

        // Send OTP via SMS using Twilio
        await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: twilioPhoneNumber,
            to: phone,
        });

        console.log(`OTP sent to ${phone}: ${otp}`); // Log OTP for backend purposes

        // Return success message without revealing the OTP (for security reasons)
        return {
            success: true,
            message: 'OTP sent successfully',
        };
    } catch (error) {
        console.error('Failed to send OTP:', error);
        throw new Error('Failed to send OTP');
    }
};

// Verify OTP function
exports.verifyOTP = async (mobileNumber, otp) => {
    try {
        const otpRecord = await DriverOTP.findOne({ mobileNumber, otp });

        if (!otpRecord) {
            throw new Error('Invalid OTP');
        }

        const now = new Date();
        if (otpRecord.expiresAt < now) {
            throw new Error('OTP has expired');
        }

        // Delete the OTP record after successful verification
        await DriverOTP.deleteOne({ _id: otpRecord._id });

        return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
        throw new Error(error.message || 'Failed to verify OTP');
    }
};
