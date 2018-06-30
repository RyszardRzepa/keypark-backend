const { GoogleApis } = require('googleapis');
const googleapis = new GoogleApis();

const cloudiot = googleapis.cloudiot('v1');

const PROJECT_ID = 'keypark-backend';
const REGION = 'europe-west1';
const REGISTRY = 'asset-tracker-registry';

const API_SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

let deviceID = "0";
let deviceState = "0";

function handleDeviceGet(authClient, name, device_id, err, data) {

  if (err) {
    console.error(new Error('Error with get device'))
    return null;
  }

  const newConfig = { ledState: deviceState };
  const mydata = new Buffer(JSON.stringify(newConfig), 'utf-8');
  const binaryData = mydata.toString('base64');

  const request2 = {
    name: name,
    resource: {
      'versionToUpdate': 0,
      'binaryData': binaryData
    },
    auth: authClient
  };

  cloudiot.projects.locations.registries.devices.modifyCloudToDeviceConfig(request2, (err, mydata) => {
    if (err) {
      console.error(new Error('Error patching device'));
      return null;
    } else {
      console.log('Patched device:', device_id, 'mydata', mydata);
      return null;
    }
  });
}

function handleAuth(err, authClient) {

  const device_id = deviceID;
  const name = `projects/${PROJECT_ID}/locations/${REGION}/registries/${REGISTRY}/devices/${device_id}`;

  if (err) {
    console.error(new Error('Error in handleAuth()'));
    return null;
  }

  if (authClient.createScopedRequired &&
    authClient.createScopedRequired()) {
    console.log('in create scope', authClient)
    authClient = authClient.createScoped(
      API_SCOPES);
  }

  const request = {
    name: name,
    auth: authClient
  };

  // Get device version
  const devices = cloudiot.projects.locations.registries.devices;
  devices.get(request, (err, data) => handleDeviceGet(authClient, name, device_id, err, data));
}

/**
 * Receive a http request with deviceId and LED state, then
 * call modifyCloudToDeviceConfig method of Cloud IoT Core
 * to update the device configuration.
 */
module.exports = function (deviceId, ledState) {
  if (deviceId === null) {
    return Error('Param `deviceId` is required!');
  }
  if (ledState === null) {
    return Error('Param `ledState` is required!');
  }

  deviceState = ledState;
  deviceID = deviceId;

  googleapis.auth.getApplicationDefault(handleAuth);
};
