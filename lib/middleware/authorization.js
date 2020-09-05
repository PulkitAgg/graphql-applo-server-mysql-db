const { AuthenticationError } = require('apollo-server');
const { skip } = require('graphql-resolvers');
const jwt = require('jsonwebtoken');


function isAuthenticated(parent, args, { tokenVerify, err }) {
    return tokenVerify ? skip : err;
}

function checkToken(req) {
    return new Promise((res, rej) => {
        jwt.verify(req.headers.authtoken, 'config.cfg.jwtSecretKey', function (err, decoded) {
            if (err) {
                rej(new AuthenticationError('Invalid Token!'));
            } else {
                res(skip);
            }
        })
    })
}

async function createToken(user, secret = 'config.cfg.jwtSecretKey', expiresIn = 100000) {
    const { id, email, name } = user;
    return await jwt.sign({ id, email, name }, secret, {
        expiresIn,
    });
};

module.exports = {
    isAuthenticated,
    checkToken,
    createToken,
}



