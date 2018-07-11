const UpdateDeviceConfig = require('./UpdateDeviceConfig');

module.exports = function (change, context) {

  // Monitor the 'updated' value of the device data and 
  // send commit command to device if value is updated
  //...
  
  
  var message = {
    heading : "commit"
  }
  return UpdateDeviceConfig(devId, message)
};
