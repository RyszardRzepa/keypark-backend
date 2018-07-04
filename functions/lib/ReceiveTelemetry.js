var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const admin = require('firebase-admin');
const db = admin.firestore();
/**
 * Receive data from pubsub, then
 * Maintain last device data on Firestore 'devices' collections
 */
module.exports = function (message) {
    return __awaiter(this, void 0, void 0, function* () {
        //console.log(message);
        const attributes = message.attributes;
        const deviceId = attributes['deviceId'];
        //console.log(deviceId);
        //TODO: find out why message does not arrive as JSON
        const messageBody = message.data ? Buffer.from(message.data, 'base64').toString() : null;
        //temp fix is to re-encode message to JSON
        const obj = JSON.parse(messageBody);
        const led_state = obj['led_state'];
        //console.log(obj['led_state']);
        //const deviceId = attributes['deviceId'];
        const data = {
            deviceId: deviceId || 'id',
            ledStatus: led_state || 'status'
        };
        console.log('data', data);
        return null;
        // return db.collection('devices').add(deviceId, data);
    });
};
//# sourceMappingURL=ReceiveTelemetry.js.map