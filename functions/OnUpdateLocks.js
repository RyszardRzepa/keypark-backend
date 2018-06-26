const functions = require('firebase-functions');

module.exports = functions.firestore
  .document('locks/{lockId}')
  .onUpdate((change, context) => {
    console.log('context', context)
    console.log('change after data', change.after.data());

    // If we set `/users/marie` to {name: "marie"} then
    // context.params.userId == "marie"
    // ... and ...
    // change.after.data() == {name: "Marie"}
  });
