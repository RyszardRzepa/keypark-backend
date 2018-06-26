const admin = require('firebase-admin');
const db = admin.firestore();
/**
 * Receive data from pubsub, then
 * Maintain last device data on Firestore 'devices' collections
 */
module.exports = function (message) {

  //console.log(message);
  const attributes = message.attributes;
  const deviceId = attributes['deviceId'];
  //console.log(deviceId);

  //TODO: find out why message does not arrive as JSON
  const messageBody = message.data ? Buffer.from(message.data, 'base64').toString() : null;
  //temp fix is to re-encode message to JSON
  var obj = JSON.parse(messageBody);
  const led_state = obj['led_state'];
  //console.log(obj['led_state']);

  //const deviceId = attributes['deviceId'];
  const data = {
    deviceId: deviceId,
    ledStatus: led_state
  };

  return db.collection('devices').add(deviceId, data);
};

/**
 * Maintain last status in Firestore
 */
function updateCurrentDataFirestore(deviceRef, data) {

  return deviceRef.set(
    {
      ledStatus: data.ledStatus
    },
    { merge: true }
  );
}
