var jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    let idToken;
    let data;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('CheckIfUserIsAuthenitcated, Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        let token = req.headers.authorization.split('Bearer ')[1];


        await jwt.verify(token, 'B3tqod284iQgGkUkyDSm9TJp5BC3', function (err, decoded) {
            if(err) {
                res.send(err)
            }
            console.log('decoded', decoded) // bar
            res.send(decoded)
        });
    } else {
        res.status(400).send('unauthorized');
        return;
    }
    res.status(200).send(`yee auth: ${data}`)
};