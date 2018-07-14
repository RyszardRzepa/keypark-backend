"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// const UserReadDataFromLock = require('./UserReadDataFromLock');
// const UpdateDeviceConfigFunction = require('./UpdateDeviceConfigFunction');
// const OnUpdateLocks = require('./OnUpdateLocks');
// const ReceiveTelemetry = require('./ReceiveTelemetry');
const test = require('./test');
// exports.userReadDataFromLock = functions.https.onRequest(UserReadDataFromLock);
// exports.updateDeviceConfig = functions.https.onRequest(UpdateDeviceConfigFunction);
// exports.onUpdateLocks = functions.firestore.document('locks/{lockId}').onUpdate(OnUpdateLocks);
// exports.receiveTelemetry = functions.pubsub.topic('telemetry-topic').onPublish(ReceiveTelemetry);
exports.test = functions.https.onRequest(test);
//# sourceMappingURL=index.js.map