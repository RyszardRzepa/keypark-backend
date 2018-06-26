const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const OnUpdateLocks = require('./OnUpdateLocks');
const ReceiveTelemetry = require('./ReceiveTelemetry');
const UpdateDeviceConfig = require('./UpdateDeviceConfig');

// exports.helloWorld = functions.https.onRequest()
exports.onUpdateLocks = functions.firestore.document('locks/{lockId}').onUpdate(OnUpdateLocks);
exports.receiveTelemetry = functions.pubsub.topic('telemetry-topic').onPublish(ReceiveTelemetry);