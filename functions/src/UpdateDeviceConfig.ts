import api from './GlobalVariables';

const cloudiot = api.googleapis.cloudiot('v1');

const PROJECT_ID = 'keypark-backend';
const REGION = 'europe-west1';
const REGISTRY = 'asset-tracker-registry';

const API_SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

let deviceID = "0";
let message = "0";

async function handleDeviceGet(authClient, name, device_id, err, data) {

    if (err) {
        console.error(new Error('Error with get device'))
        return null;
    }

    const mydata = new Buffer(JSON.stringify(message), 'utf-8');
    const binaryData = mydata.toString('base64');
    console.log('in handleDeviceGet, after binaryData')
    const request2 = {
        name: name,
        resource: {
            'versionToUpdate': 0,
            'binaryData': binaryData
        },
        auth: authClient
    };

    cloudiot.projects.locations.registries.devices.modifyCloudToDeviceConfig(request2, (iotError, clientData) => {
        if (iotError) {
            console.error(new Error('Error patching device'));
            return null;
        } else {
            console.log('Patched device:', device_id, 'data', clientData);
        }
    });
    return null;
}

async function handleAuth(authError, authClient) {

    const device_id = deviceID;
    const name = `projects/${PROJECT_ID}/locations/${REGION}/registries/${REGISTRY}/devices/${device_id}`;
    let client = authClient;

    if (authError) {
        console.error(new Error('Error in handleAuth()'));
        return null;
    }

    if (client.createScopedRequired &&
        client.createScopedRequired()) {
        client = client.createScoped(API_SCOPES);
    }

    const request = {
        name: name,
        auth: client
    };

    // Get device version
    const devices = cloudiot.projects.locations.registries.devices;
    console.log('auth is done: start handleDeviceGet()')
    devices.get(request, (err, data) => handleDeviceGet(authClient, name, device_id, err, data));
}

/**
 * Receive a http request with deviceId and LED state, then
 * call modifyCloudToDeviceConfig method of Cloud IoT Core
 * to update the device configuration.
 */
module.exports = async function (deviceId, msg) {
    if (deviceId === null) {
        return null
    }
    if (msg === null) {
        return null
    }

    message = msg;
    deviceID = deviceId;

    return api.googleapis.auth.getApplicationDefault(handleAuth);
};
