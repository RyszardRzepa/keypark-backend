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
const GlobalVariables_1 = require("../GlobalVariables");
const CheckIfUserIsAuthenitcated = (req) => __awaiter(this, void 0, void 0, function* () {
    let isAuth = { auth: false, idToken: null };
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
        console.error('CheckIfUserIsAuthenitcated, No Firebase ID token was passed as a Bearer token in the Authorization');
        return isAuth;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('CheckIfUserIsAuthenitcated, Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else {
        return isAuth;
    }
    try {
        const decodedIdToken = yield GlobalVariables_1.default.admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedIdToken.phone_number;
        const isAdmin = false;
        const now = Date.now();
        if (!isAdmin) {
            const refUser = GlobalVariables_1.default.db.collection('locks').where(phoneNumber + '.key_expire', ">", now);
            const userSnap = yield refUser.get();
            userSnap.forEach((doc) => isAuth = { auth: doc.exists, idToken });
        }
        else {
            const refAdmin = GlobalVariables_1.default.db.collection('locks').where('roles.' + phoneNumber, "==", 'admin');
            const adminSnamp = yield refAdmin.get();
            adminSnamp.forEach((doc) => isAuth = { auth: doc.exists, idToken });
        }
        return isAuth;
    }
    catch (e) {
        console.error('Error while verifying Firebase ID token or geting snap from locks collection:', e);
        return isAuth;
    }
});
exports.default = CheckIfUserIsAuthenitcated;
//# sourceMappingURL=CheckIfUserIsAuthenitcated.js.map