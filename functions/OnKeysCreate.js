const admin = require('firebase-admin');

function createUser(phone_number) {
  const db = admin.firestore();
  admin.auth().createUser({ phoneNumber: phone_number, disabled: false })
    .then(function (user) {
      return db.collection('user').add({ phone_number, created: Date.now() })
    })
    .catch(function (err) {
      return err;
    })
}

module.exports = function (snap, context) {
  // check if phone number dont exist in invite property
  if (!snap.data().invite) {
    return null;
  }
  const phone_number = snap.data().invite;
  admin.auth().getUserByPhoneNumber(phone_number)
    .then(userRecord => {
      if (!userRecord) {
        // create new user in  auth and in 'users' collection
        return createUser(phone_number);
      }
      // send sms to user about package info
    }).catch(err => err)
};
