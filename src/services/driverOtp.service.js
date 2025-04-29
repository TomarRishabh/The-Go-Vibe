// driverOtp.service.js
const DriverOTP = require('../models/DriverOTP');
const Driver = require('../models/driver.model');
const twilio = require('twilio');
const logger = require('../utils/logger');

// Create a more resilient Twilio client
const createTwilioClient = () => {
  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      return twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
    logger.warn('Twilio credentials not found in environment variables');
    return null;
  } catch (error) {
    logger.error('Error creating Twilio client:', error);
    return null;
  }
};

const client = createTwilioClient();

exports.sendOTP = async (phone) => {
  let timeoutId;
  
  try {
    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Operation timed out after 20 seconds'));
      }, 20000);
    });
    
    // Your actual operation
    const operationPromise = (async () => {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      logger.info(`Generated OTP for ${phone}: ${otp}`);
      
      // First, remove any existing OTP records for this number
      try {
        await DriverOTP.deleteMany({ mobileNumber: phone });
        logger.info(`Deleted existing OTP records for ${phone}`);
      } catch (deleteError) {
        logger.warn(`Error deleting existing OTP records: ${deleteError.message}`);
        // Continue anyway
      }
      
      // Create a new OTP record
      try {
        const otpRecord = new DriverOTP({
          mobileNumber: phone,
          otp,
          otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
        });
        
        const savedOtp = await otpRecord.save();
        logger.info(`OTP saved to database with ID: ${savedOtp._id}`);
        
        // Double-check that it was saved properly
        const checkOtp = await DriverOTP.findOne({ mobileNumber: phone });
        if (checkOtp) {
          logger.info(`Verified OTP saved for ${phone}: ${checkOtp.otp}`);
        } else {
          logger.warn(`Failed to verify OTP was saved for ${phone}`);
        }
      } catch (dbError) {
        logger.error(`Error saving OTP to database: ${dbError.message}`);
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      // Find or create driver with error handling
      try {
        let driver = await Driver.findOne({ mobileNumber: phone });
        
        if (!driver) {
          logger.info(`Creating new driver record for ${phone}`);
          driver = new Driver({
            mobileNumber: phone,
            name: `User (${phone})`,
            email: `user_${phone.replace(/\D/g, '')}@example.com`,
            isRegistered: false
          });
          
          await driver.save();
          logger.info('Driver record created');
        }
      } catch (driverError) {
        logger.error('Error with driver record:', driverError);
        // Continue even if driver save fails
      }
      
      // Send SMS
      if (!client) {
        logger.warn('Twilio client not available');
        return {
          success: true,
          message: `OTP generated: ${otp} (SMS not sent - Twilio not configured)`,
          otp // Include OTP in response since SMS isn't sent
        };
      }
      
      try {
        logger.info(`Sending SMS to ${phone}`);
        const message = await client.messages.create({
          body: `Your The-Go-Vibe verification code is: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });
        
        logger.info(`SMS sent with SID: ${message.sid}`);
        
        return {
          success: true,
          message: "OTP sent successfully to your phone"
        };
      } catch (twilioError) {
        logger.error('Twilio error:', twilioError);
        
        return {
          success: false,
          message: `Failed to send SMS: ${twilioError.message}`,
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        };
      }
      
      // For dev environment, always return the OTP in the response
      return {
        success: true,
        message: `OTP sent successfully ${process.env.NODE_ENV === 'development' ? '(DEV MODE: ' + otp + ')' : ''}`,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      };
    })();
    
    // Race between the timeout and the actual operation
    const result = await Promise.race([operationPromise, timeoutPromise]);
    return result;
  } catch (error) {
    logger.error(`Error in sendOTP: ${error.message}`);
    
    return {
      success: false,
      message: `Failed to send OTP: ${error.message}`
    };
  } finally {
    // Clear the timeout if it's still active
    if (timeoutId) clearTimeout(timeoutId);
  }
};

exports.verifyOTP = async (phone, inputOTP) => {
  try {
    logger.info(`Verifying OTP for ${phone}: ${inputOTP}`);
    
    // Special case for development mode - master OTP
    if (process.env.NODE_ENV === 'development' && inputOTP === '123456') {
      logger.info('Development mode: Using master OTP code');
      return true;
    }
    
    // Try to find the OTP record
    const otpRecord = await DriverOTP.findOne({
      mobileNumber: phone
    });
    
    // Log what we found for debugging
    if (otpRecord) {
      logger.info(`Found OTP record for ${phone}`);
      logger.info(`Stored OTP: ${otpRecord.otp}, Expiry: ${otpRecord.otpExpiry}`);
      logger.info(`Current time: ${new Date()}`);
      logger.info(`Is expired: ${otpRecord.otpExpiry < new Date()}`);
    } else {
      logger.warn(`No OTP record found for ${phone}`);
    }
    
    // No OTP record found
    if (!otpRecord) {
      // For development, log a comprehensive error message
      logger.error(`No OTP record found in database for ${phone}`);
      
      // Check if there are any OTPs at all in the database
      const allOTPs = await DriverOTP.find({}).lean();
      logger.info(`Total OTP records in database: ${allOTPs.length}`);
      
      if (allOTPs.length > 0) {
        // Show a sample record for debugging
        logger.info(`Sample OTP record: ${JSON.stringify(allOTPs[0])}`);
      }
      
      throw new Error('Invalid or expired OTP');
    }
    
    // Check if OTP is expired
    const isExpired = otpRecord.otpExpiry < new Date();
    if (isExpired) {
      logger.warn(`OTP for ${phone} has expired`);
      throw new Error('OTP has expired');
    }
    
    // Check if OTP matches
    if (otpRecord.otp !== inputOTP) {
      logger.warn(`Invalid OTP attempt for ${phone} - Expected: ${otpRecord.otp}, Got: ${inputOTP}`);
      throw new Error('Invalid OTP');
    }
    
    // OTP is valid, mark as verified
    otpRecord.verified = true;
    await otpRecord.save();
    logger.info(`OTP verified successfully for ${phone}`);
    
    return true;
  } catch (error) {
    logger.error(`Error in verifyOTP: ${error.message}`);
    // Add more context to the error
    if (error.message === 'Invalid or expired OTP') {
      throw new Error('Invalid or expired OTP. Please request a new OTP.');
    }
    throw error;
  }
};
