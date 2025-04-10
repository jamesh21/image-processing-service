const { StatusCodes } = require('http-status-codes')

class BadRequestError extends Error {
    constructor(message, code) {
        super(message)
        this.statusCode = StatusCodes.BAD_REQUEST
        this.code = code
    }
}

module.exports = BadRequestError