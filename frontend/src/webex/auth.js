// TODO: UNSAFE, the JWTs should be generated server side and then sent to the client. 
// The iss and secret should never be exposed to the browser... but for a quick demo it is fine (:
var jwt = require('jsonwebtoken');
const axios = require('axios').default;

function generateJWT(userId, userName) {
    const iss = '';
    const secret = '';
    let id  =  (Math.floor((Math.random() * 100000) + 1)).toString();
    let sub = userId + id
    let payload = {
        'sub': sub,
        'name': userName,
        'iss': iss,
    }
    let token = jwt.sign(
        payload,
        Buffer.from(secret, 'base64'),
        { expiresIn: '1h' },
    )
    return token;
}

function generateAccessToken(jwtToken) {
    // https://developer.webex.com/docs/guest-issuer
    // curl --request POST \
    // --header "Authorization: Bearer GUEST_TOKEN" \
    const url = "https://api.ciscospark.com/v1/jwt/login"
    const config = {
        headers: {'Authorization': "Bearer " + jwtToken}
    };
    return axios.post(url, null, config);
}

export { generateJWT, generateAccessToken};