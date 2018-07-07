const twilio = require('twilio');
const key = require('./env');

module.exports = new twilio.Twilio(key.accountSid, key.authtoken);

