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
const PROJECT_ID = 'keypark-backend';
const REGION = 'europe-west1';
const REGISTRY = 'asset-tracker-registry';
const API_SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];
let deviceID = "0";
let deviceState = "0";
function handleDeviceGet(authClient, name, device_id, err, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (err) {
            console.error(new Error('Error with get device'));
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
        cloudiot.projects.locations.registries.devices.modifyCloudToDeviceConfig(request2, (iotError, clientData) => {
            if (iotError) {
                console.error(new Error('Error patching device'));
                return null;
            }
            else {
                console.log('Patched device:', device_id, 'data', clientData);
                GlobalVariables_1.default.db.collection('locks').doc(device_id).update({ update_ready: true });
            }
        });
        return null;
    });
}
function handleAuth(authError, authClient) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
/**
 * Receive a http request with deviceId and LED state, then
 * call modifyCloudToDeviceConfig method of Cloud IoT Core
 * to update the device configuration.
 */
module.exports = function (deviceId, ledState) {
    return __awaiter(this, void 0, void 0, function* () {
        if (deviceId === null) {
            return null;
        }
        if (ledState === null) {
            return null;
        }
        deviceState = ledState;
        deviceID = deviceId;
        return GlobalVariables_1.default.googleapis.auth.getApplicationDefault(handleAuth);
    });
};
//# sourceMappingURL=UpdateDeviceConfig.js.map