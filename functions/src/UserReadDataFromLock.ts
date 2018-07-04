'use strict';

const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});
const app = express();
import api from './GlobalVariables';

const admin = api.admin;

// validate firebase user token to return limited data to the app user.
const validateFirebaseIdToken = async (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken)
        const phoneNumber = decodedIdToken.phone_number;
        const today = Date.now();
        let data = [];
        let ref = await api.db.collection('locks').where([phoneNumber] + '.key_expire', ">", today);
        let snap = await ref.get();
        snap.forEach(doc => {
            let obj = {
                locked: doc.data().locked,
                name: doc.data().name
            };
            data.push(obj)
        });
        req.user = data;
        return next();
    } catch (e) {
        // if admin.auth().verifyIdToken(idToken) failed
        console.error('Error while verifying Firebase ID token:', e);
        res.status(403).send('Unauthorized');
    }
};

app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.get('/', (req, res) => {
    res.status(200).send(req.user);
});

module.exports = app;