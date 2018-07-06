import api from './GlobalVariables';

const cloudiot = api.googleapis.cloudiot('v1');
import CheckIfUserIsAuthenticated from './utils/CheckIfUserIsAuthenitcated';

const PROJECT_ID = 'keypark-backend';
const REGION = 'europe-west1';
const REGISTRY = 'asset-tracker-registry';

const API_SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

let deviceID = "0";
let deviceState = "0";

async function handleDeviceGet(authClient, name, device_id, err, data, res) {

    if (err) {
        console.error(new Error('Error with get device'))
        res.status(403).send('Error with get device')
        return null;
    }

    const newConfig = {ledState: deviceState};
    const mydata = new Buffer(JSON.stringify(newConfig), 'utf-8');
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
            res.status(403).send('Error patching device');
            return null;
        } else {
            console.log('Patched device:', device_id, 'data', clientData);
            res.status(200).end();
        }
    });
    res.status(200).end();
}

async function handleAuth(authError, authClient, res) {

    const device_id = deviceID;
    const name = `projects/${PROJECT_ID}/locations/${REGION}/registries/${REGISTRY}/devices/${device_id}`;
    let client = authClient;

    if (authError) {
        console.error(new Error('Error in handleAuth()'));
        res.status(403).send('Error in handleAuth()')
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
    devices.get(request, (err, data) => handleDeviceGet(authClient, name, device_id, err, data, res));
}

/**
 * Receive a http request with deviceId and LED state, then
 * call modifyCloudToDeviceConfig method of Cloud IoT Core
 * to update the device configuration.
 */
module.exports = async function (req, res) {
    const isAuth = await CheckIfUserIsAuthenticated(req);
    if (!isAuth) {
        res.status(200).send('You are not unauthorized, to open this lock')
        console.log('UpdateDevice config Unauthorized, to open lock');
        return null;
    }
    const deviceId = req.query.deviceId;
    const ledState = req.query.ledStatus;

    console.log(deviceId);
    if (deviceId === null) {
        res.json({err: 'Param `deviceId` is required!'});
        console.log('Param `deviceId` is required!')
        return;
    }

    console.log(ledState);
    if (ledState === null) {
        res.json({err: 'Param `ledState` is required'});
        console.log('Param `ledState` is required')
        return;
    }

    deviceState = ledState;
    deviceID = deviceId;

    try {
        await api.googleapis.auth.getApplicationDefault((authError, authClient,) => handleAuth(authError, authClient, res));
        res.send('Config Updated')
    } catch (e) {
        res.status(403).send('Something went wrong updating config')
    }
};
