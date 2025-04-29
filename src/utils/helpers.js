/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Generated OTP
 */
exports.generateOTP = (length = 6) => {
  // Generate a random 6-digit number
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Check if application is running in development mode
 */
exports.isDevMode = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if we should use real SMS
 * Force SMS sending
 */
exports.shouldUseSMS = () => {
  return true; // Always return true to force SMS
};