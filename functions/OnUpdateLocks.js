const UpdateDeviceConfig = require('./UpdateDeviceConfig');

module.exports = function (change, context) {
    console.log('context', context)
    console.log('change after data', change.after.data());

    if(change.after.data().locked === change.before.data().locked) {
      return console.log('no locked field update')
    }

  return UpdateDeviceConfig()

    // If we set `/users/marie` to {name: "marie"} then
    // context.params.userId == "marie"
    // ... and ...
    // change.after.data() == {name: "Marie"}
  };
