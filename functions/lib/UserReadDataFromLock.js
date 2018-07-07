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
const CheckIfUserIsAuthenitcated_1 = require("./utils/CheckIfUserIsAuthenitcated");
const admin = GlobalVariables_1.default.admin;
let userData = null;
// validate firebase user token to return limited data to the app user.
const UserReadDataFromLock = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const isAuth = yield CheckIfUserIsAuthenitcated_1.default(req);
    if (!isAuth.auth) {
        res.status(403).send('You are not unauthorized to read this data');
        return;
    }
    try {
        const decodedIdToken = yield admin.auth().verifyIdToken(isAuth.idToken);
        const phoneNumber = decodedIdToken.phone_number;
        const today = Date.now();
        const data = [];
        const ref = yield GlobalVariables_1.default.db.collection('locks').where([phoneNumber] + '.key_expire', ">", today);
        const snap = yield ref.get();
        yield snap.forEach(doc => {
            const obj = {
                locked: doc.data().locked,
                name: doc.data().name,
                id: doc.id,
            };
            data.push(obj);
        });
        userData = data;
        return next();
    }
    catch (e) {
        // if admin.auth().verifyIdToken(idToken) failed
        console.error('Error while verifying Firebase ID token:', e);
        res.status(403).send('Unauthorized');
    }
});
app.use(cors);
app.use(cookieParser);
app.use(UserReadDataFromLock);
app.get('/', (req, res) => {
    res.status(200).send(userData);
});
module.exports = app;
//# sourceMappingURL=UserReadDataFromLock.js.map