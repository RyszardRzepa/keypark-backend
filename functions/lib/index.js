"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const UserReadDataFromLock = require('./UserReadDataFromLock');
const UpdateDeviceConfigFunction = require('./UpdateDeviceConfigFunction');
const UpdateFleetFirmware = require('./UpdateFleetFirmware');
// const ReceiveTelemetry = require('./ReceiveTelemetry');
// const OnKeyCreate = require('./OnKeysCreate');
const OnUpdateLocks = require('./OnUpdateLocks');
const onCommitRequest = require('./onCommitRequest');
exports.userReadDataFromLock = functions.https.onRequest(UserReadDataFromLock);
exports.updateDeviceConfig = functions.https.onRequest(UpdateDeviceConfigFunction);
exports.UpdateFleetFirmware = functions.https.onRequest(UpdateFleetFirmware);
exports.onUpdateLocks = functions.firestore.document('locks/{lockId}').onUpdate(OnUpdateLocks);
exports.onCommitRequest = functions.firestore.document('devices/{lockId}/firmware').onUpdate(onCommitRequest);
// exports.receiveTelemetry = functions.pubsub.topic('telemetry-topic').onPublish(ReceiveTelemetry);
//# sourceMappingURL=index.js.map