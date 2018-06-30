import api from './GlobalVariables';

const cloudiot = api.googleapis.cloudiot('v1');

const PROJECT_ID = 'keypark-backend';
const REGION = 'europe-west1';
const REGISTRY = 'asset-tracker-registry';

const API_SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

let deviceID = "0";
let deviceState = "0";

async function handleDeviceGet(authClient, name, device_id, err, data) {

    if (err) {
        console.error(new Error('Error with get device'))
        return null;
    }

    const newConfig = {ledState: deviceState};
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

    cloudiot.projects.locations.registries.devices.modifyCloudToDeviceConfig(request2, (iotError, clientData) => {
        if (iotError) {
            console.error(new Error('Error patching device'));
            return null;
        } else {
            console.log('Patched device:', device_id, 'data', clientData);
            api.db.collection('locks').doc(device_id).update({ update_ready: true })
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
    devices.get(request, (err, data) => handleDeviceGet(authClient, name, device_id, err, data));
}

/**
 * Receive a http request with deviceId and LED state, then
 * call modifyCloudToDeviceConfig method of Cloud IoT Core
 * to update the device configuration.
 */
module.exports = async function (deviceId, ledState) {
    if (deviceId === null) {
        return null
    }
    if (ledState === null) {
        return null
    }

    deviceState = ledState;
    deviceID = deviceId;

    return api.googleapis.auth.getApplicationDefault(handleAuth);
};
