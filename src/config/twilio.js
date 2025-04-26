const twilio = require('twilio');

const accountSid = process.env.REDACTED;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

module.exports = {
  client,
  twilioPhoneNumber,
};