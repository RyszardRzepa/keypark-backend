"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const admin = require('firebase-admin');
const googleapis = new googleapis_1.GoogleApis();
const db = admin.firestore();
const api = {
    googleapis,
    db
};
exports.default = api;
//# sourceMappingURL=GlobalVariables.js.map