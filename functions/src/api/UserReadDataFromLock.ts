'use strict';

const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});
const app = express();

import api from '../GlobalVariables';
import CheckIfUserIsAuthenticated from '../utils/CheckIfUserIsAuthenitcated';

const admin = api.admin;
let userData = null;

// This enpoint is meant only for mobile app users
// validate firebase user token to return limited data to the app user.
const UserReadDataFromLock = async (req, res, next) => {
    const isAuth = await CheckIfUserIsAuthenticated(req);
    if (!isAuth.auth) {
        res.status(403).send('You are not unauthorized to read this data')
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(isAuth.idToken)
        const phoneNumber = decodedIdToken.phone_number;
        const today = Date.now();
        const data = [];
        const ref = await api.db.collection('locks').where([phoneNumber] + '.key_expire', ">", today);
        const snap = await ref.get();
        await snap.forEach(doc => {
            const obj = {
                locked: doc.data().locked,
                name: doc.data().name,
                id: doc.id,
            };
            data.push(obj)
        });
        userData = data;
        return next();
    } catch (e) {
        // if admin.auth().verifyIdToken(idToken) failed
        console.error('Error while verifying Firebase ID token:', e);
        res.status(403).send('Unauthorized');
    }
};

app.use(cors);
app.use(cookieParser);
app.use(UserReadDataFromLock);
app.get('/', (req, res) => {
    res.status(200).send(userData);
});

module.exports = app;