'use strict';

import api from '../GlobalVariables';

const CheckIfUserIsAuthenitcated = async (req) => {
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
        console.error('CheckIfUserIsAuthenitcated, No Firebase ID token was passed as a Bearer token in the Authorization');
        return false;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('CheckIfUserIsAuthenitcated, Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        return false;
    }
    try {
        const decodedIdToken = await api.admin.auth().verifyIdToken(idToken)
        const phoneNumber = decodedIdToken.phone_number;
        const isAdmin = false;

        const now = Date.now();
        let isAuth = null;

        if (!isAdmin) {
            let refUser = api.db.collection('locks').where(phoneNumber + '.key_expire', ">", now);
            let userSnap = await refUser.get();
            userSnap.forEach((doc) => isAuth = doc.exists);
        } else {
            let refAdmin = api.db.collection('locks').where('roles.' + phoneNumber, "==", 'admin');
            let adminSnamp = await refAdmin.get();
            adminSnamp.forEach((doc) => isAuth = doc.exists);
        }
        return isAuth;
    } catch (e) {
        console.error('Error while verifying Firebase ID token or geting snap from locks collection:', e);
        return false;
    }
};

export default CheckIfUserIsAuthenitcated;