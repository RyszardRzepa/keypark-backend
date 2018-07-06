"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const GlobalVariables_1 = require("./GlobalVariables");
const cloudiot = GlobalVariables_1.default.googleapis.cloudiot('v1');
const CheckIfUserIsAuthenitcated_1 = require("./utils/CheckIfUserIsAuthenitcated");
const PROJECT_ID = 'keypark-backend';
const REGION = 'europe-west1';
const REGISTRY = 'asset-tracker-registry';
const API_SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];
let deviceID = "0";
let deviceState = "0";
function handleDeviceGet(authClient, name, device_id, err, data, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (err) {
            console.error(new Error('Error with get device'));
            res.status(403).send('Error with get device');
            return null;
        }
        const newConfig = { ledState: deviceState };
        const mydata = new Buffer(JSON.stringify(newConfig), 'utf-8');
        const binaryData = mydata.toString('base64');
        console.log('in handleDeviceGet, after binaryData');
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
            }
            else {
                console.log('Patched device:', device_id, 'data', clientData);
                res.status(200).end();
            }
        });
        res.status(200).end();
    });
}
function handleAuth(authError, authClient, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const device_id = deviceID;
        const name = `projects/${PROJECT_ID}/locations/${REGION}/registries/${REGISTRY}/devices/${device_id}`;
        let client = authClient;
        if (authError) {
            console.error(new Error('Error in handleAuth()'));
            res.status(403).send('Error in handleAuth()');
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
        console.log('auth is done: start handleDeviceGet()');
        devices.get(request, (err, data) => handleDeviceGet(authClient, name, device_id, err, data, res));
    });
}
/**
 * Receive a http request with deviceId and LED state, then
 * call modifyCloudToDeviceConfig method of Cloud IoT Core
 * to update the device configuration.
 */
module.exports = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const isAuth = yield CheckIfUserIsAuthenitcated_1.default(req);
        if (!isAuth) {
            res.status(200).send('You are not unauthorized, to open this lock');
            console.log('UpdateDevice config Unauthorized, to open lock');
            return null;
        }
        const deviceId = req.query.deviceId;
        const ledState = req.query.ledStatus;
        console.log(deviceId);
        if (deviceId === null) {
            res.json({ err: 'Param `deviceId` is required!' });
            console.log('Param `deviceId` is required!');
            return;
        }
        console.log(ledState);
        if (ledState === null) {
            res.json({ err: 'Param `ledState` is required' });
            console.log('Param `ledState` is required');
            return;
        }
        deviceState = ledState;
        deviceID = deviceId;
        try {
            yield GlobalVariables_1.default.googleapis.auth.getApplicationDefault((authError, authClient) => handleAuth(authError, authClient, res));
            res.send('Config Updated');
        }
        catch (e) {
            res.status(403).send('Something went wrong updating config');
        }
    });
};
//# sourceMappingURL=UpdateDeviceConfigFunction.js.map