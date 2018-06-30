const admin = require('firebase-admin');
const db = admin.firestore();
// const twilio = require('./twilio');

function createUser(phone_number) {
  return admin.auth().createUser({
    email: phone_number + '@gmail.com',
    password: phone_number + '@gmail.com',
    phoneNumber: phone_number,
    disabled: false,
  })
    .then((user) => {
      const msg = 'Your package is ready to pickup. Use mobile app to open the module. https://www.wp.pl';
      console.log('user created', user)
     return  db.collection('users').doc(phone_number).set({ phone_number, created: Date.now() })
    })
    .catch((err) => {
      console.log('error createUser()', err)
      return err;
    })
}

module.exports = function (snap, context) {
  // check if phone number dont exist in invite property
  if (!snap.data().invite) {
    console.log('no invite, snap.data()', snap.data())
    return null;
  }
  const phone_number = snap.data().invite;
  return admin.auth().getUserByPhoneNumber(phone_number)
    .then((userRecord) => {
      const msg = 'Your order is ready to pickup. Address...'
      console.log('User exist send sms with order details', userRecord)
      return msg;
    }).catch(() => {
      return createUser(phone_number)
    })

};
