'use strict';

import api from '../GlobalVariables';

const CheckIfUserIsAuthenitcated = async (req) => {
    let isAuth = {auth: false, idToken: null};

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
        console.error('CheckIfUserIsAuthenitcated, No Firebase ID token was passed as a Bearer token in the Authorization');
        return isAuth;
    }

    let idToken;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('CheckIfUserIsAuthenitcated, Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        return isAuth;
    }

    try {
        const decodedIdToken = await api.admin.auth().verifyIdToken(idToken)
        const phoneNumber = decodedIdToken.phone_number;
        const isAdmin = false;

        const now = Date.now();

        if (!isAdmin) {
            const refUser = api.db.collection('locks').where(phoneNumber + '.key_expire', ">", now);
            const userSnap = await refUser.get();
            userSnap.forEach((doc) => isAuth = {auth: doc.exists, idToken});
        } else {
            const refAdmin = api.db.collection('locks').where('roles.' + phoneNumber, "==", 'admin');
            const adminSnamp = await refAdmin.get();
            adminSnamp.forEach((doc) => isAuth = {auth: doc.exists, idToken});
        }
        return isAuth;
    } catch (e) {
        console.error('Error while verifying Firebase ID token or geting snap from locks collection:', e);
        return isAuth;
    }
};

export default CheckIfUserIsAuthenitcated;