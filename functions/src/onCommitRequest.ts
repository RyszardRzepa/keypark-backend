const UpdateDeviceConfig = require('./UpdateDeviceConfig');

module.exports = function (change, context) {

  // Monitor the 'firmware' value of the device data and 
  // send commit command to device if value is updated
  if (change.after.data().firmware === change.before.data().firmware) {
    return null;
  }
  
  const devId = context.params.lockId;
  const message = {
    heading : "commit"
  }
  return UpdateDeviceConfig(devId, message)
};
