const UpdateDeviceConfig = require('./UpdateDeviceConfig');

module.exports = function (change, context) {
  // if locked filed is updated updateDeviceConfig
  if (change.after.data().locked === change.before.data().locked) {
    return null;
  }

  const deviceValue = change.after.data().locked ? '1' : '0';
  const devId = context.params.lockId;
  return UpdateDeviceConfig(devId, deviceValue)
};
