// driverAuth.controller.js
const driverOtpService = require('../services/driverOtp.service');
const { generateToken } = require('../services/driverAuth.service');
const driverAuthService = require('../services/driverAuth.service');

exports.sendOTP = async (req, res, next) => {
    console.log('Request received for send-otp:', req.body);
    try {
        const { phone } = req.body;

        if (!phone) {
            console.log('Phone number missing in request');
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        console.log(`Attempting to send OTP to ${phone}`);
        
        // Call the sendOTP service to send OTP
        const response = await driverOtpService.sendOTP(phone);
        console.log('OTP service response:', response);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error in sendOTP controller:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send OTP', 
            error: error.message 
        });
    }
};

// Check your sendOTP function implementation to see what field name it's expecting

exports.verifyOTP = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number and OTP are required' 
            });
        }

        // Special case for development mode
        if (process.env.NODE_ENV === 'development' && otp === '123456') {
            console.log('Using master OTP in development mode');
        } else {
            try {
                // Verify the OTP
                await driverOtpService.verifyOTP(phone, otp);
            } catch (otpError) {
                console.error('OTP verification error:', otpError);
                return res.status(400).json({
                    success: false,
                    message: otpError.message || 'OTP verification failed'
                });
            }
        }

        // Get or create driver record
        let driver = await driverAuthService.getDriverByMobileNumber(phone);
        if (!driver) {
            console.log(`Creating new driver for phone: ${phone}`);
            driver = await driverAuthService.createDriver(phone);
        }

        // Generate JWT using driver ID (more secure than using phone)
        const token = generateToken(driver._id);

        // Return successful response with isRegistered flag
        return res.status(200).json({
            success: true,
            token,
            isRegistered: driver.isRegistered,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Error in verifyOTP controller:', error);
        next(error);
    }
};

// Add this function to your controller
exports.completeRegistration = async (req, res, next) => {
    try {
        console.log('Complete registration request received:', req.body);
        
        // Get driver ID from auth middleware
        const driverId = req.driver._id;
        
        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Extract registration data from request body
        const {
            name,
            email,
            vehicleType,
            vehicleModel,
            vehicleColor,
            vehicleNumber,
            licenseNumber,
            // Add other fields as needed
        } = req.body;

        // Validate required fields
        if (!name || !email || !vehicleType || !vehicleModel || 
            !vehicleColor || !vehicleNumber || !licenseNumber) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        console.log(`Updating driver profile for ID: ${driverId}`);

        // Update driver with registration details
        const updatedDriver = await driverAuthService.updateDriver(driverId, {
            name,
            email,
            vehicleType,
            vehicleModel,
            vehicleColor,
            vehicleNumber,
            licenseNumber,
            isRegistered: true,  // Mark as registered
            registrationCompleted: new Date()
        });

        if (!updatedDriver) {
            console.error('Failed to update driver profile');
            return res.status(500).json({
                success: false,
                message: 'Failed to complete registration'
            });
        }

        console.log('Registration completed successfully for driver:', updatedDriver._id);

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Registration completed successfully',
            driver: {
                id: updatedDriver._id,
                name: updatedDriver.name,
                email: updatedDriver.email,
                isRegistered: updatedDriver.isRegistered
            }
        });

    } catch (error) {
        console.error('Error in completeRegistration controller:', error);
        
        // Send a more descriptive error message
        return res.status(500).json({
            status: 'error',
            message: 'Failed to complete registration',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
