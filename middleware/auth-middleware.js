const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require('../errors/unauthenticated-error')
const auth = (req, res, next) => {
    //check if bearer token is available
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthenticatedError('Missing Authorization header or bearer token')
    }
    // get token value
    const token = authHeader.split(' ')[1]
    try {
        // verify using jwt if bearer token is valid
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        // set user in req header
        req.user = { userId: payload.id, name: payload.name, email: payload.email };
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid')
    }

    next()
}

module.exports = auth