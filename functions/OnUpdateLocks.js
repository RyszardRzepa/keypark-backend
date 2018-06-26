const axios = require('axios');

handleUpdateConfig = function (value) {
  const devId = "esp32_1423FC";

  const link = 'https://us-central1-keypark-backend.cloudfunctions.net/updateDeviceConfig?';
  const param1 = 'deviceId=' + devId;
  const param2 = '&ledStatus=' + value;
  const url = link + param1 + param2;

  return axios({
    url,
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json'
    },
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'no-cors', // no-cors, cors, *same-origin
  })
}

module.exports = function (change, context) {
  console.log('context', context)
  console.log('check data', change.after.data().locked, change.before.data().locked);

  if (change.after.data().locked === change.before.data().locked) {
    return console.log('no locked field update')
  }
  const deviceValue = change.after.data().locked ? '1' : '0';
  handleUpdateConfig(deviceValue)

  // If we set `/users/marie` to {name: "marie"} then
  // context.params.userId == "marie"
  // ... and ...
  // change.after.data() == {name: "Marie"}
};
