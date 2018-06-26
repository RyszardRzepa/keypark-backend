const {GoogleApis} = require('googleapis');
const googleapis = new GoogleApis();

const cloudiot = googleapis.cloudiot('v1');

const PROJECT_ID = 'keypark-backend';
const REGION = 'europe-west1';
const REGISTRY = 'asset-tracker-registry';

const API_SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/compute',
  'https://www.googleapis.com/auth/cloudiot'];

var deviceID = "0";
var deviceState = "0";

function handleDeviceGet(authClient, name, device_id, err, data) {

  if (err) {
    console.log('Error with get device:', device_id);
    console.log(err);
    return;
  }

  console.log('Got device:', device_id);

  const newConfig = { ledState: deviceState };
  const mydata = new Buffer(JSON.stringify(newConfig), 'utf-8');
  const binaryData = mydata.toString('base64');

  var request2 = {
    name: name,
    resource: {
      'versionToUpdate' : 0,
      'binaryData' : binaryData
    },
    auth: authClient
  };

  console.log(request2);

  var devices = cloudiot.projects.locations.registries.devices;
  devices.modifyCloudToDeviceConfig(request2, (err, mydata) => {
    if (err) {
      console.log('Error patching device:', device_id);
      console.log(err);
    } else {
      console.log('Patched device:', device_id);
      console.log(mydata);
    }
  });
}

function handleAuth(err, authClient) {

  const device_id = deviceID;
  const name = `projects/${PROJECT_ID}/locations/${REGION}/registries/${REGISTRY}/devices/${device_id}`;

  if (err) {
    console.log(err);
  }

  if (authClient.createScopedRequired &&
    authClient.createScopedRequired()) {
    console.log('in create scope', authClient)
    authClient = authClient.createScoped(
      API_SCOPES);
  }

  var request = {
    name: name,
    auth: authClient
  };
  // Get device version
  var devices = cloudiot.projects.locations.registries.devices;
  devices.get(request, (err, data) =>
    handleDeviceGet(authClient, name, device_id, err, data));
}

/**
 * Receive a http request with deviceId and LED state, then
 * call modifyCloudToDeviceConfig method of Cloud IoT Core
 * to update the device configuration.
 */
module.exports = function (req, res) {

  console.log(req.query.deviceId);
  console.log(req.query.ledStatus);

  let deviceId = req.query.deviceId;
  let ledState = req.query.ledStatus;

  console.log(deviceId);
  if (deviceId === null) {
    res.json({ err: 'Param `deviceId` is required!' });
    return;
  }

  console.log(ledState);
  if (ledState === null) {
    res.json({ err: 'Param `ledState` is required' });
    return;
  }

  deviceState = ledState;
  deviceID = deviceId;

  googleapis.auth.getApplicationDefault(handleAuth);

  res.status(200).end();
};
