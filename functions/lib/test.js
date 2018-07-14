// var jwt = require('jsonwebtoken');
// var token = jwt.sign({
//         uid: 'B3tqod284iQgGkUkyDSm9TJp5BC3',
//         iat: Math.floor(Date.now() / 1000) + (60 * 60)
//     },
//     'B3tqod284iQgGkUkyDSm9TJp5BC3', (err, token) => {
//     console.log('token', token)
//         jwt.verify(token, 'B3tqod284iQgGkUkyDSm9TJp5BC3', function(err, decoded) {
//             console.log('decoded', decoded) // bar
//         });
//     });
//
// //
// // module.exports = async (req, res) => {
// //     res.status(200).send('yeee')
// // };
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var jwt = require('jsonwebtoken');
module.exports = (req, res) => __awaiter(this, void 0, void 0, function* () {
    let idToken;
    let data;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('CheckIfUserIsAuthenitcated, Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        let apiKey = req.headers.authorization.split('Bearer ')[1];
        yield jwt.verify(apiKey, 'B3tqod284iQgGkUkyDSm9TJp5BC3', function (err, decoded) {
            if (err) {
                res.send(err);
            }
            console.log('decoded', decoded); // bar
            res.send(decoded);
        });
    }
    else {
        res.status(400).send('unauthorized');
        return;
    }
    res.status(200).send(`yee auth: ${data}`);
});
//# sourceMappingURL=test.js.map