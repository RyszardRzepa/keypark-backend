'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({ origin: true });
const app = express();
const GlobalVariables_1 = require("./GlobalVariables");
const admin = GlobalVariables_1.default.admin;
// validate firebase user token to return limited data to the user.
const validateFirebaseIdToken = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    console.log('Check if request is authorized with Firebase ID token');
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }
    else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }
    try {
        const decodedIdToken = yield admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedIdToken.phone_number;
        const today = Date.now();
        let data = [];
        let ref = yield GlobalVariables_1.default.db.collection('locks').where([phoneNumber] + '.key_expire', ">", today);
        let snap = yield ref.get();
        snap.forEach(doc => {
            let obj = {
                locked: doc.data().locked,
                name: doc.data().name
            };
            data.push(obj);
        });
        req.user = data;
        return next();
    }
    catch (e) {
        console.error('Error while verifying Firebase ID token:', e);
        res.status(403).send('Unauthorized');
    }
});
app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.get('/', (req, res) => {
    res.status(200).send(req.user);
});
module.exports = app;
//# sourceMappingURL=UpdateLock.js.map