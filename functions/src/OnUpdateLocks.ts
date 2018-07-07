const l = require('lodash');
const findObjectDiff = require('./utils/findObjectDiff');
import api from './GlobalVariables';

const twilio = require('./twilio');

module.exports = async function (change, context) {
    const dataAfter = change.after.data();
    const dataBefore = change.before.data();
    const checkForFieldsUpdate = (
        dataAfter.locked === dataBefore.locked &&
        dataAfter.available === dataBefore.available &&
        dataAfter.name === dataBefore.name);

    //check if lock get new user or update the existing user. Send sms with order details.
    if (checkForFieldsUpdate && l.isEqual(dataAfter.roles, dataBefore.roles)) {
        //double check for diff in user and if just one property is updated
        const diff = findObjectDiff(dataBefore, dataAfter);
        if (Object.keys(diff).length === 1) {
            const phoneNumber = Object.keys(diff)[0];
            const user = await api.admin.auth().getUserByPhoneNumber(phoneNumber);
            const orderDetails = `Twoje zamowienie jest gotowe do odbioru w paczkobocie na ulicy:
                 ${dataBefore.address}.
                 Uzyj aplikacji mobilnej do odebrania zamowienia.
                 Link do aplikacji: https://keypark.page.link/phone`;
            if (user) {
                await twilio.messages.create({
                    body: orderDetails,
                    from: '+18577632916',
                    to: '+4791911225'
                }).catch(err => err)
                // user exist send sms with the order details
                return null;
            }
            // Dont need to create a new user. When they sign in first time it will create new user
            // send sms with orderDetials to newUser
            return null;
        } else {
            console.log(' noo diff', Object.keys(diff))
            return null;
        }
    }

    return null;
};
