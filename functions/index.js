const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const OnUpdateLocks = require('./OnUpdateLocks');
const ReceiveTelemetry = require('./ReceiveTelemetry');

// exports.helloWorld = functions.https.onRequest()
exports.onUpdateLocks = OnUpdateLocks;
exports.receiveTelemetry = ReceiveTelemetry;