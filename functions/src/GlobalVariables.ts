import {GoogleApis} from 'googleapis';

const admin = require('firebase-admin')

const googleapis = new GoogleApis();
const db = admin.firestore();
const api = {
    googleapis,
    db,
    admin
};

export default api;
