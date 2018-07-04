import * as functions from 'firebase-functions';
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const OnUpdateLocks = require('./OnUpdateLocks');
const ReceiveTelemetry = require('./ReceiveTelemetry');
// const OnKeyCreate = require('./OnKeysCreate');
const UserReadDataFromLock = require('./UserReadDataFromLock');
const UpdateDeviceConfigFunction = require('./UpdateDeviceConfigFunction');

exports.onUpdateLocks = functions.firestore.document('locks/{lockId}').onUpdate(OnUpdateLocks);
exports.receiveTelemetry = functions.pubsub.topic('telemetry-topic').onPublish(ReceiveTelemetry);
exports.userReadDataFromLock = functions.https.onRequest(UserReadDataFromLock);
exports.updateDeviceConfig = functions.https.onRequest(UpdateDeviceConfigFunction);
